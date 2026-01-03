import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { AutofillForm } from "./autofill-form";
  
  export default function DocumentAutofillPage() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Document Auto-Fill</CardTitle>
          <CardDescription>
            Select a permit template and upload a document (like an existing plan or ID). The AI will extract relevant data and pre-fill the form for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AutofillForm />
        </CardContent>
      </Card>
    );
  }
  