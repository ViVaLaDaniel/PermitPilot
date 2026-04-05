'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateDocumentInputSchema = z.object({
  documentUrl: z.string().describe('Public or signed URL of the uploaded document (image or PDF).'),
  requirementLabel: z.string().describe('The name of the requirement (e.g., Site Plan).'),
  requirementDescription: z.string().describe('The detailed description of what this document must contain.'),
  municipalityContext: z.string().optional().describe('Context about the city rules.'),
});

const ValidateDocumentOutputSchema = z.object({
  isValid: z.boolean().describe('True if the document matches the requirement.'),
  confidence: z.number().min(0).max(1).describe('Confidence score of the validation.'),
  feedback: z.string().describe('Clear feedback for the user. If invalid, explain why.'),
  extractedData: z.record(z.any()).optional().describe('Any data extracted from the document (e.g., square footage).'),
});

export type ValidateDocumentInput = z.infer<typeof ValidateDocumentInputSchema>;
export type ValidateDocumentOutput = z.infer<typeof ValidateDocumentOutputSchema>;

const prompt = ai.definePrompt({
  name: 'validateDocumentPrompt',
  input: {schema: ValidateDocumentInputSchema},
  output: {schema: ValidateDocumentOutputSchema},
  prompt: `You are a Permit Validation Specialist and Data Extraction Expert for building departments.
  
  Your task is two-fold:
  1. REVIEW: Verify if the uploaded document satisfies the specific permit requirement.
  2. EXTRACT: Locate and extract key technical data points from the document into a structured JSON.

  Requirement: {{requirementLabel}}
  Description: {{requirementDescription}}
  Municipality Context: {{municipalityContext}}

  Document to review: {{media url=documentUrl}}

  Extraction Guidelines:
  - If "Site Plan": Extract "Lot Area", "Building Coverage", "Setbacks" (Front/Rear/Side).
  - If "Floor Plan": Extract "Total Living Area (sq ft)", "Number of Bedrooms", "Number of Bathrooms".
  - If "Title 24": Extract "Compliance Margin %", "HVAC Type", "Water Heater Type".
  - For others: Extract any dates, addresses, or professional license numbers found.

  Instructions:
  1. Inspect the document carefully.
  2. If the document is NOT what the label claims, set isValid: false and feedback: "This does not appear to be a {{requirementLabel}}".
  3. If valid, set isValid: true.
  4. Fill 'extractedData' with key-value pairs of found data. Use numbers where possible.

  Validation Result:`,
});

export const validateDocument = ai.defineFlow(
  {
    name: 'validateDocumentFlow',
    inputSchema: ValidateDocumentInputSchema,
    outputSchema: ValidateDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
