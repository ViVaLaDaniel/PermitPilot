"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { extractDataFromDocuments } from "@/ai/flows/extract-data-from-documents-for-autofill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, UploadCloud, CheckCircle } from "lucide-react";
import { useUser, useFirestore } from "@/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";

const templates = {
  buildingPermit: {
    name: "Standard Building Permit",
    fields: [
      { name: "applicantName", label: "Applicant Name" },
      { name: "projectAddress", label: "Project Address" },
      { name: "contactNumber", label: "Contact Number" },
      { name: "emailAddress", label: "Email Address" },
      { name: "contractorId", label: "Contractor ID" },
    ],
  },
  electricalPermit: {
    name: "Electrical Permit",
    fields: [
      { name: "propertyOwner", label: "Property Owner" },
      { name: "siteAddress", label: "Site Address" },
      { name: "electricianLicense", label: "Electrician License #" },
      { name: "scopeOfWork", label: "Scope of Work" },
    ],
  },
};

type TemplateKey = keyof typeof templates;

async function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AutofillForm() {
  const [document, setDocument] = useState<File | null>(null);
  const [template, setTemplate] = useState<TemplateKey>("buildingPermit");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm();
  const activeTemplate = templates[template];

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocument(e.target.files[0]);
    }
  };

  const handleExtract = async () => {
    if (!document) {
      toast({
        title: "Missing Document",
        description: "Please upload a document to extract data from.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    form.reset();

    try {
      const docDataUri = await fileToDataUri(document);
      const templateFields = activeTemplate.fields.map((f) => f.name).join(", ");
      
      const result = await extractDataFromDocuments({
        documentDataUri: docDataUri,
        templateFields,
      });

      // Populate form with extracted data
      for (const [key, value] of Object.entries(result)) {
        if (activeTemplate.fields.some(f => f.name === key)) {
          form.setValue(key, value);
        }
      }

      toast({
        title: "Extraction Complete",
        description: "The form has been auto-filled with the extracted data.",
      });

    } catch (error) {
      console.error(error);
      toast({
        title: "Error Extracting Data",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePermit = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit an application.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = form.getValues();
      const permitId = doc(collection(firestore, `users/${user.uid}/permits`)).id;

      const permitData = {
        id: permitId,
        projectName: formData.applicantName || formData.propertyOwner || "New Permit Application",
        permitType: template === "buildingPermit" ? "Building" : "Electrical",
        status: "In Review",
        submittedDate: new Date().toISOString().split("T")[0],
        city: formData.projectAddress || formData.siteAddress || "Unknown Location",
        // Store all other fields as metadata if needed, but for now we map to the main permit type
        ...formData
      };

      await setDoc(
        doc(firestore, `users/${user.uid}/permits`, permitId),
        permitData
      );

      toast({
        title: "Application Submitted",
        description: "Your permit application has been successfully submitted.",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast({
        title: "Submission Failed",
        description: "Could not submit the application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">Select Permit Template</Label>
            <Select
              value={template}
              onValueChange={(value: TemplateKey) => setTemplate(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(templates).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="document">Upload Document</Label>
            <Input
              id="document"
              type="file"
              onChange={handleDocumentChange}
              accept="image/*,application/pdf"
            />
             {document && <p className="text-sm text-muted-foreground">Selected: {document.name}</p>}
          </div>
          <Button onClick={handleExtract} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Auto-fill Form
              </>
            )}
          </Button>
        </div>
        
        <Card className="bg-muted/30">
          <CardContent className="p-6">
            <h3 className="text-lg font-headline mb-4">{activeTemplate.name}</h3>
            <Form {...form}>
              <form className="space-y-4">
                {activeTemplate.fields.map((field) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          <Input {...formField} value={formField.value || ''} placeholder={`Extracted ${field.label}...`} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <div className="pt-4">
                  <Button
                    type="button"
                    onClick={handleCreatePermit}
                    disabled={isSubmitting}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
