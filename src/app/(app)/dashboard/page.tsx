"use client";

import { useUser, useFirestore } from "@/firebase";
import { projectService } from "@/firebase/projects";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/lib/data";
import { FolderKanban, MapPin, Calendar, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      if (!user) return;
      try {
        const userProjects = await projectService.getUserProjects(firestore, user.uid);
        setProjects(userProjects);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to load projects.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    if (user) fetchProjects();
    else if (!isUserLoading) setIsLoading(false);
  }, [user, firestore, isUserLoading, toast]);

  if (isUserLoading || isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Your Projects</h1>
          <p className="text-muted-foreground">Manage your active permit applications</p>
        </div>
        <Button asChild>
          <Link href="/checklist-generator">
            <Sparkles className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {!projects || projects.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardHeader className="text-center py-12">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FolderKanban className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>No projects yet</CardTitle>
            <CardDescription className="max-w-sm mx-auto">
              Start by using our AI Assistant to generate a permit checklist for your project.
            </CardDescription>
            <div className="mt-6">
              <Button asChild variant="outline">
                <Link href="/checklist-generator">Get Started</Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="mb-2 uppercase tracking-wider text-[10px]">
                    {project.projectType.replace('_', ' ')}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {project.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {project.address.city}, {project.address.state}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="group-hover:translate-x-1 transition-transform">
                    View <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-16" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                {[...Array(6)].map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-5 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(6)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
