import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { ValidatorForm } from "./validator-form";
  
  export default function CodeValidatorPage() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Code Validation</CardTitle>
          <CardDescription>
            Validate your permit application against local building codes using Retrieval-Augmented Generation (RAG) to prevent costly errors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ValidatorForm />
        </CardContent>
      </Card>
    );
  }
  