"use client";

import {
  Activity,
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
} from "lucide-react";
import {
  collection,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Permit } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig = {
  "In Review": {
    icon: Activity,
    color: "bg-blue-500",
  },
  Approved: {
    icon: CheckCircle2,
    color: "bg-green-500",
  },
  Rejected: {
    icon: AlertTriangle,
    color: "bg-red-500",
  },
  "Inspection Scheduled": {
    icon: CalendarCheck,
    color: "bg-orange-500",
  },
};

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const permitsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, `users/${user.uid}/permits`)
    );
  }, [firestore, user]);

  const {
    data: permits,
    isLoading: isPermitsLoading,
    error: permitsError,
  } = useCollection<Permit>(permitsQuery);

  if (isUserLoading || isPermitsLoading) {
    return <DashboardSkeleton />;
  }

  if (permitsError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error loading permits: {permitsError.message}</p>
      </div>
    );
  }

  const stats = {
    inReview: permits?.filter((p) => p.status === "In Review").length ?? 0,
    approved: permits?.filter((p) => p.status === "Approved").length ?? 0,
    rejected: permits?.filter((p) => p.status === "Rejected").length ?? 0,
    inspectionScheduled:
      permits?.filter((p) => p.status === "Inspection Scheduled").length ?? 0,
  };

  return (
    <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>In Review</CardDescription>
            <CardTitle className="text-4xl font-headline">
              {stats.inReview}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Permits currently under review.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-4xl font-headline">
              {stats.approved}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Permits approved this month.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Inspection Scheduled</CardDescription>
            <CardTitle className="text-4xl font-headline">
              {stats.inspectionScheduled}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Upcoming inspections.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rejected</CardDescription>
            <CardTitle className="text-4xl font-headline">
              {stats.rejected}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Requires attention.
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Permit Status</CardTitle>
          <CardDescription>
            An overview of all your permit applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Permit Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permits && permits.length > 0 ? (
                permits.map((permit) => (
                  <TableRow key={permit.id}>
                    <TableCell className="font-medium">
                      {permit.projectName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{permit.permitType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            statusConfig[permit.status]?.color ?? "bg-gray-400"
                          }`}
                        />
                        {permit.status}
                      </div>
                    </TableCell>
                    <TableCell>{permit.city}</TableCell>
                    <TableCell>{permit.submittedDate}</TableCell>
                    <TableCell>
                      {permit.status === "Inspection Scheduled" && (
                        <Button size="sm" variant="outline">
                          <CalendarCheck className="mr-2 h-4 w-4" />
                          Add to Calendar
                        </Button>
                      )}
                      {permit.status === "Approved" && (
                        <Button size="sm" variant="outline">
                          View Documents
                        </Button>
                      )}
                      {permit.status === "Rejected" && (
                        <Button size="sm" variant="destructive">
                          Review Errors
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No permits found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
        </CardContent>
      </Card>
    </div>
  );
}
