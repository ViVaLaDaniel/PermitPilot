//Validate the permit application against local building codes using RAG.
'use server';

/**
 * @fileOverview Validates a permit application against local building codes using RAG.
 *
 * - validatePermitApplicationAgainstLocalCodes - A function that validates a permit application against local building codes.
 * - ValidatePermitApplicationAgainstLocalCodesInput - The input type for the validatePermitApplicationAgainstLocalCodes function.
 * - ValidatePermitApplicationAgainstLocalCodesOutput - The return type for the validatePermitApplicationAgainstLocalCodes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidatePermitApplicationAgainstLocalCodesInputSchema = z.object({
  permitApplication: z.string().describe('The permit application to validate.'),
  localBuildingCodes: z.string().describe('The local building codes to validate against.'),
});

export type ValidatePermitApplicationAgainstLocalCodesInput =
  z.infer<typeof ValidatePermitApplicationAgainstLocalCodesInputSchema>;

const ValidatePermitApplicationAgainstLocalCodesOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the permit application is valid according to the local building codes.'),
  validationErrors: z.array(z.string()).describe('A list of validation errors found in the permit application.'),
});

export type ValidatePermitApplicationAgainstLocalCodesOutput =
  z.infer<typeof ValidatePermitApplicationAgainstLocalCodesOutputSchema>;

export async function validatePermitApplicationAgainstLocalCodes(
  input: ValidatePermitApplicationAgainstLocalCodesInput
): Promise<ValidatePermitApplicationAgainstLocalCodesOutput> {
  return validatePermitApplicationAgainstLocalCodesFlow(input);
}

const validatePermitApplicationAgainstLocalCodesPrompt = ai.definePrompt({
  name: 'validatePermitApplicationAgainstLocalCodesPrompt',
  input: {schema: ValidatePermitApplicationAgainstLocalCodesInputSchema},
  output: {schema: ValidatePermitApplicationAgainstLocalCodesOutputSchema},
  prompt: `You are an expert in local building codes.

You will be given a permit application and the local building codes.

You will determine whether the permit application is valid according to the local building codes.

If the permit application is not valid, you will provide a list of validation errors.

Permit Application: {{{permitApplication}}}

Local Building Codes: {{{localBuildingCodes}}}`,
});

const validatePermitApplicationAgainstLocalCodesFlow = ai.defineFlow(
  {
    name: 'validatePermitApplicationAgainstLocalCodesFlow',
    inputSchema: ValidatePermitApplicationAgainstLocalCodesInputSchema,
    outputSchema: ValidatePermitApplicationAgainstLocalCodesOutputSchema,
  },
  async input => {
    const {output} = await validatePermitApplicationAgainstLocalCodesPrompt(input);
    return output!;
  }
);

