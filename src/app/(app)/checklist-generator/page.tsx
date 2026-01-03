import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChecklistForm } from "./checklist-form";

export default function ChecklistGeneratorPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Permit Checklist Generator</CardTitle>
        <CardDescription>
          Upload project site photos and provide a description to get an
          AI-generated checklist of required permits.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChecklistForm />
      </CardContent>
    </Card>
  );
}
