import { config } from 'dotenv';
config();

import '@/ai/flows/validate-permit-application-against-local-codes.ts';
import '@/ai/flows/extract-data-from-documents-for-autofill.ts';
import '@/ai/flows/generate-permit-checklist-from-photos-and-voice.ts';