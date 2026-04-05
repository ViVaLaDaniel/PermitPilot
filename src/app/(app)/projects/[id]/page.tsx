"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { projectService } from "@/firebase/projects";
import { uploadDocument } from "@/firebase/storage";
import { Project, Permit, ChecklistItem, PermitStatus } from "@/lib/data";
import { 
  Loader2, 
  MapPin, 
  ArrowLeft, 
  Building2, 
  ClipboardList, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronDown,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<PermitStatus, { label: string, color: string, icon: any }> = {
  'DRAFT': { label: 'Draft', color: 'bg-slate-500', icon: Clock },
  'READY_FOR_SUBMISSION': { label: 'Ready for Submission', color: 'bg-green-600', icon: CheckCircle2 },
  'SUBMITTED': { label: 'Submitted', color: 'bg-blue-600', icon: CheckCircle2 },
  'IN_REVIEW': { label: 'In Review', color: 'bg-amber-600', icon: Clock },
  'REVISIONS_REQUIRED': { label: 'Revisions Required', color: 'bg-red-600', icon: AlertCircle },
  'APPROVED': { label: 'Approved', color: 'bg-emerald-600', icon: CheckCircle2 },
  'INSPECTION_SCHEDULED': { label: 'Inspection Scheduled', color: 'bg-indigo-600', icon: Clock },
  'FINALED': { label: 'Finaled', color: 'bg-gray-800', icon: CheckCircle2 },
};

export default function ProjectDetailPage() {
  const { id } = useParams() as { id: string };
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingItem, setUploadingItem] = useState<string | null>(null);

  const loadProject = async () => {
    if (!user || !id) return;
    try {
      const data = await projectService.getProjectWithPermits(firestore, id);
      if (!data || data.createdBy !== user.uid) {
        toast({ title: "Unauthorized", description: "You don't have access to this project.", variant: "destructive" });
        router.push("/dashboard");
        return;
      }
      setProject(data);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load project details.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) loadProject();
    else if (!isUserLoading && !user) router.push("/");
  }, [user, id, isUserLoading]);

  const handleFileUpload = async (permitId: string, item: ChecklistItem, file: File) => {
    if (!project) return;
    
    setUploadingItem(item.id);
    try {
      const { path } = await uploadDocument(project.id, permitId, item.id, file);
      
      await projectService.updateChecklistItem(firestore, project.id, permitId, item.id, {
        status: 'UPLOADED',
        documentId: path
      });

      toast({ title: "File Uploaded", description: `Successfully uploaded ${file.name}` });
      await loadProject(); // Refresh to show new status
    } catch (error) {
      console.error(error);
      toast({ title: "Upload Failed", description: "Could not upload document.", variant: "destructive" });
    } finally {
      setUploadingItem(null);
    }
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading project details...</p>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold">{project.name}</h1>
          <div className="flex items-center gap-2 text-muted-foreground mt-2">
            <MapPin className="h-4 w-4" />
            <span>{project.address.city}, {project.address.state}</span>
            <span className="mx-2">•</span>
            <Badge variant="secondary">{project.projectType.replace('_', ' ')}</Badge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Created on</p>
          <p className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid gap-6">
        <h2 className="text-2xl font-headline font-semibold flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          Permits & Workflows
        </h2>

        <Accordion type="multiple" defaultValue={project.permits.map(p => p.id)} className="space-y-4">
          {project.permits.map((permit) => {
            const StatusIcon = statusConfig[permit.status].icon;
            const requiredItems = permit.checklist.filter(i => i.isRequired);
            const completedRequired = requiredItems.filter(i => i.status === 'UPLOADED' || i.status === 'VALIDATED').length;
            const progress = (completedRequired / requiredItems.length) * 100;

            return (
              <AccordionItem key={permit.id} value={permit.id} className="border rounded-xl bg-card overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex flex-1 items-center justify-between text-left">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${statusConfig[permit.status].color} text-white`}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{permit.type} Permit</p>
                        <p className="text-sm text-muted-foreground">
                          {completedRequired} of {requiredItems.length} required documents uploaded
                        </p>
                      </div>
                    </div>
                    <Badge className={`${statusConfig[permit.status].color} mr-4`}>
                      {statusConfig[permit.status].label}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 border-t bg-muted/10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 py-4">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500" 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                      <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
                    </div>

                    <div className="grid gap-3">
                      {permit.checklist.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-background gap-4">
                          <div className="flex items-start gap-3">
                            {item.status === 'VALIDATED' || item.status === 'UPLOADED' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 mt-0.5" />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.label}</span>
                                {item.isRequired && (
                                  <Badge variant="outline" className="text-[10px] h-4 border-orange-200 text-orange-700 bg-orange-50">REQUIRED</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {item.documentId && (
                                <Badge variant="secondary" className="gap-1">
                                    <FileText className="h-3 w-3" />
                                    Document Ready
                                </Badge>
                            )}
                            
                            <div className="relative">
                              <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(permit.id, item, file);
                                }}
                                disabled={uploadingItem === item.id}
                              />
                              <Button size="sm" variant={item.documentId ? "outline" : "primary"} disabled={uploadingItem === item.id}>
                                {uploadingItem === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {item.documentId ? "Replace" : "Upload"}
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
