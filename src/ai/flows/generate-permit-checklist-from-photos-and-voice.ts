'use server';

/**
 * @fileOverview Generates a checklist of required permits based on project site photos and voice descriptions.
 *
 * - generatePermitChecklistFromPhotosAndVoice - A function that handles the permit checklist generation process.
 * - GeneratePermitChecklistInput - The input type for the generatePermitChecklistFromPhotosAndVoice function.
 * - GeneratePermitChecklistOutput - The return type for the generatePermitChecklistFromPhotosAndVoice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePermitChecklistInputSchema = z.object({
  photoDataUris: z
    .array(z.string())
    .describe(
      "A list of photos of the project site, as data URIs that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>' for each image."
    ),
  voiceDescription: z.string().describe('A voice description of the project site.'),
});
export type GeneratePermitChecklistInput = z.infer<typeof GeneratePermitChecklistInputSchema>;

const GeneratePermitChecklistOutputSchema = z.object({
  permitChecklist: z.array(z.string()).describe('A checklist of required permits.'),
});
export type GeneratePermitChecklistOutput = z.infer<typeof GeneratePermitChecklistOutputSchema>;

export async function generatePermitChecklistFromPhotosAndVoice(
  input: GeneratePermitChecklistInput
): Promise<GeneratePermitChecklistOutput> {
  return generatePermitChecklistFromPhotosAndVoiceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePermitChecklistFromPhotosAndVoicePrompt',
  input: {schema: GeneratePermitChecklistInputSchema},
  output: {schema: GeneratePermitChecklistOutputSchema},
  prompt: `You are an expert in identifying required permits for construction projects.

  Based on the provided photos and voice description of the project site, generate a checklist of required permits.

  Photos:
  {{#each photoDataUris}}
  {{media url=this}}
  {{/each}}

  Voice Description: {{{voiceDescription}}}

  Checklist:`, // the 'Checklist:' at the end asks for the output to be returned in that format
});

const generatePermitChecklistFromPhotosAndVoiceFlow = ai.defineFlow(
  {
    name: 'generatePermitChecklistFromPhotosAndVoiceFlow',
    inputSchema: GeneratePermitChecklistInputSchema,
    outputSchema: GeneratePermitChecklistOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
