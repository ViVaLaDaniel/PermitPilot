"use client";

import { useState } from "react";
import Image from "next/image";
import { generatePermitChecklistFromPhotosAndVoice, type GeneratePermitChecklistOutput } from "@/ai/flows/generate-permit-checklist-from-photos-and-voice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Check, Image as ImageIcon, Loader2, Sparkles, UploadCloud, X, MapPin, Building2, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore } from "@/firebase";
import { projectService } from "@/firebase/projects";
import { useRouter } from "next/navigation";

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
  const [recommendation, setRecommendation] = useState<GeneratePermitChecklistOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

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
    setRecommendation(null);

    try {
      const photoDataUris = await Promise.all(photos.map(fileToDataUri));

      const result = await generatePermitChecklistFromPhotosAndVoice({
        photoDataUris,
        voiceDescription: description,
      });

      setRecommendation(result);
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

  const handleCreateProject = async () => {
    if (!user || !recommendation) return;
    
    setIsCreating(true);
    try {
      const projectId = await projectService.createProject(firestore, user.uid, recommendation);
      toast({
        title: "Project Created!",
        description: `Successfully created ${recommendation.projectName}. Redirecting to dashboard...`,
      });
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Creating Project",
        description: "Could not save project to database. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-2 border-primary/20">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Selected Municipality: Los Angeles, CA
            </CardTitle>
            <CardDescription>
                AI will use current LADBS (Los Angeles Dept. of Building and Safety) rules for ADU projects.
            </CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="photos">Project Photos</Label>
            <Label htmlFor="photos-input" className="cursor-pointer">
              <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Drag & drop site photos here, or click to select files
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
                    className="rounded-md object-cover aspect-square w-full h-full shadow-sm"
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
            placeholder="e.g., 'Converting existing 400 sq ft garage into a 1-bedroom ADU. New kitchen and bathroom will be added.'"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-11 px-8">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Project...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Recommendation
            </>
          )}
        </Button>
      </form>

      {recommendation && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-2 border-green-500/20">
            <CardHeader className="bg-green-500/5">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl font-headline flex items-center gap-2">
                            <Check className="h-6 w-6 text-green-500" />
                            {recommendation.projectName}
                        </CardTitle>
                        <CardDescription className="text-lg">
                            {recommendation.projectType} Project in {recommendation.municipalityId}
                        </CardDescription>
                    </div>
                    <Button onClick={handleCreateProject} disabled={isCreating}>
                        {isCreating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Create Project"
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-6">
                    {recommendation.permits.map((permit, pIndex) => (
                        <div key={pIndex} className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-sm px-3 py-1">
                                    <Building2 className="h-3 w-3 mr-1" />
                                    {permit.type} Permit
                                </Badge>
                                <div className="h-px flex-1 bg-muted" />
                            </div>
                            <ul className="grid gap-3 sm:grid-cols-2">
                                {permit.requirements.map((req, rIndex) => (
                                    <li key={rIndex} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                                        <ClipboardList className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">{req.label}</p>
                                            <p className="text-xs text-muted-foreground">{req.description}</p>
                                            {req.isRequired && (
                                                <Badge variant="outline" className="mt-2 text-[10px] h-4 text-orange-600 border-orange-200 bg-orange-50">REQUIRED</Badge>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
