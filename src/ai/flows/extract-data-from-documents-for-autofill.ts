'use server';

/**
 * @fileOverview Extracts data from documents (photos or PDFs) for auto-filling permit application templates.
 *
 * - extractDataFromDocuments - A function that handles the data extraction process.
 * - ExtractDataFromDocumentsInput - The input type for the extractDataFromDocuments function.
 * - ExtractDataFromDocumentsOutput - The return type for the extractDataFromDocuments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractDataFromDocumentsInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A photo or PDF of an existing document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  templateFields: z
    .string()
    .describe("A list of comma separated fields required for auto-filling the permit application template."),
});
export type ExtractDataFromDocumentsInput = z.infer<typeof ExtractDataFromDocumentsInputSchema>;

const ExtractDataFromDocumentsOutputSchema = z.record(z.string(), z.string()).describe('A map of field names to extracted values.');
export type ExtractDataFromDocumentsOutput = z.infer<typeof ExtractDataFromDocumentsOutputSchema>;

export async function extractDataFromDocuments(
  input: ExtractDataFromDocumentsInput
): Promise<ExtractDataFromDocumentsOutput> {
  return extractDataFromDocumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractDataFromDocumentsPrompt',
  input: {schema: ExtractDataFromDocumentsInputSchema},
  output: {schema: ExtractDataFromDocumentsOutputSchema},
  prompt: `You are an expert data extraction specialist.

You will be provided with a document (photo or PDF) and a list of fields required for a permit application template. Your task is to extract the relevant data from the document and return a JSON object mapping each field name to its corresponding extracted value. If a field cannot be extracted, return an empty string for that field.

Fields to extract: {{{templateFields}}}
Document: {{media url=documentDataUri}}

Output:
`,
});

const extractDataFromDocumentsFlow = ai.defineFlow(
  {
    name: 'extractDataFromDocumentsFlow',
    inputSchema: ExtractDataFromDocumentsInputSchema,
    outputSchema: ExtractDataFromDocumentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
