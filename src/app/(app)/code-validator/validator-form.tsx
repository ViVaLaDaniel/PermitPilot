"use client";

import { useState } from "react";
import {
  validatePermitApplicationAgainstLocalCodes,
  type ValidatePermitApplicationAgainstLocalCodesOutput,
} from "@/ai/flows/validate-permit-application-against-local-codes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const mockApplication = `Project Address: 123 Main St, Anytown, USA
Scope of Work: Construct a new 120 sq ft wooden deck attached to the rear of the single-family residence.
Deck Height: 36 inches above grade.
Guardrails: 38-inch high guardrails with vertical balusters spaced 5 inches apart.
Foundation: 4 concrete piers, 8 inches in diameter, 24 inches deep.
`;

const mockCodes = `Local Building Code for Anytown, USA - Chapter 12: Decks
- Sec 12.1: Decks over 30 inches above grade require a building permit.
- Sec 12.2: Guardrails are required for decks over 30 inches high. Guardrails must be at least 36 inches in height.
- Sec 12.3: Openings in guardrails must not allow the passage of a 4-inch diameter sphere.
- Sec 12.4: Footings must be a minimum of 12 inches in diameter and 30 inches deep or below the frost line.
`;

export function ValidatorForm() {
  const [application, setApplication] = useState(mockApplication);
  const [codes, setCodes] = useState(mockCodes);
  const [result, setResult] =
    useState<ValidatePermitApplicationAgainstLocalCodesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!application || !codes) {
      toast({
        title: "Missing Information",
        description: "Please provide both the application text and local codes.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const validationResult = await validatePermitApplicationAgainstLocalCodes({
        permitApplication: application,
        localBuildingCodes: codes,
      });
      setResult(validationResult);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error During Validation",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="application">Permit Application Text</Label>
            <Textarea
              id="application"
              value={application}
              onChange={(e) => setApplication(e.target.value)}
              rows={12}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="codes">Local Building Codes</Label>
            <Textarea
              id="codes"
              value={codes}
              onChange={(e) => setCodes(e.target.value)}
              rows={12}
              className="font-mono text-xs"
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Validate Application
            </>
          )}
        </Button>
      </form>

      {result && (
        <Alert variant={result.isValid ? "default" : "destructive"}>
          {result.isValid ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertTitle className="font-headline text-lg">
            {result.isValid
              ? "Validation Passed"
              : "Validation Failed"}
          </AlertTitle>
          <AlertDescription>
            {result.isValid ? (
              "The permit application appears to be valid according to the provided local codes."
            ) : (
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {result.validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
