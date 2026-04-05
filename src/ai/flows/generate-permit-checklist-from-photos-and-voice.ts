'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import laAduRules from '@/lib/knowledge/los-angeles-adu.json';

const GeneratePermitChecklistInputSchema = z.object({
  photoDataUris: z
    .array(z.string())
    .describe(
      "A list of photos of the project site, as data URIs. Format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  voiceDescription: z.string().describe('A description of the project site and scope.'),
});

const PermitRequirementSchema = z.object({
  label: z.string(),
  description: z.string(),
  isRequired: z.boolean(),
});

const PermitSchema = z.object({
  type: z.enum(['Building', 'Electrical', 'Plumbing', 'Mechanical']),
  requirements: z.array(PermitRequirementSchema),
});

const GeneratePermitChecklistOutputSchema = z.object({
  projectName: z.string().describe('Suggested name for the project.'),
  projectType: z.string().describe('Identified project type (e.g., ADU, Remodel).'),
  municipalityId: z.string().describe('City identifier (e.g., los-angeles).'),
  permits: z.array(PermitSchema).describe('The set of permits and requirements needed.'),
});

export type GeneratePermitChecklistInput = z.infer<typeof GeneratePermitChecklistInputSchema>;
export type GeneratePermitChecklistOutput = z.infer<typeof GeneratePermitChecklistOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generatePermitChecklistFromPhotosAndVoicePrompt',
  input: {schema: GeneratePermitChecklistInputSchema},
  output: {schema: GeneratePermitChecklistOutputSchema},
  prompt: `You are a Permit Operations Expert for the City of Los Angeles. 
  
  Use the following LA ADU Municipality Rules as your SOLE SOURCE OF TRUTH for requirements:
  ${JSON.stringify(laAduRules, null, 2)}

  Task:
  1. Analyze the photos and description provided by the user.
  2. Determine if the project is an ADU or a similar residential construction.
  3. Map the project needs to the specific permits and requirements defined in the Rules above.
  4. Suggest a professional project name.

  Constraints:
  - Do NOT hallucinate requirements. Only use those listed in the Rules.
  - Be specific. If photos show a kitchen, ensure Plumbing and Electrical are included.
  
  User Inputs:
  - Photos:
  {{#each photoDataUris}}
  {{media url=this}}
  {{/each}}
  - Description: {{{voiceDescription}}}

  Generate the Permit Checklist:`,
});

export const generatePermitChecklistFromPhotosAndVoice = ai.defineFlow(
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
