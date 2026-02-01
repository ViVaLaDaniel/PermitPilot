"use client";

import { useState } from "react";
import Image from "next/image";
import { generatePermitChecklistFromPhotosAndVoice } from "@/ai/flows/generate-permit-checklist-from-photos-and-voice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Check, Image as ImageIcon, Loader2, Sparkles, UploadCloud, X } from "lucide-react";

async function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ChecklistForm() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [checklist, setChecklist] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...filesArray]);
      const filePreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPhotoPreviews(prev => [...prev, ...filePreviews]);
    }
  };
  
  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (photos.length === 0 || !description) {
      toast({
        title: "Missing Information",
        description: "Please upload at least one photo and provide a description.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setChecklist(null);

    try {
      const photoDataUris = await Promise.all(photos.map(fileToDataUri));

      const result = await generatePermitChecklistFromPhotosAndVoice({
        photoDataUris,
        voiceDescription: description,
      });

      setChecklist(result.permitChecklist);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Generating Checklist",
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
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="photos">Project Photos</Label>
            <Label htmlFor="photos-input" className="cursor-pointer">
              <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Drag & drop photos here, or click to select files
                </p>
              </div>
            </Label>
            <Input
              id="photos-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoChange}
              className="sr-only"
            />
          </div>

          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {photoPreviews.map((src, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={src}
                    alt={`Photo preview ${index + 1}`}
                    width={150}
                    height={150}
                    className="rounded-md object-cover aspect-square w-full h-full"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Project Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the project, e.g., 'Building a 10x12 foot wooden deck in the backyard, 3 feet off the ground.'"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Checklist
            </>
          )}
        </Button>
      </form>

      {checklist && (
        <Alert>
          <AlertTitle className="flex items-center gap-2 font-headline text-lg">
            <Check className="h-5 w-5 text-green-500" />
            Generated Permit Checklist
          </AlertTitle>
          <AlertDescription>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              {checklist.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
