"use client";

import Link from "next/link";
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
import { type Municipality } from "@/lib/data";
import { ExternalLink, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function DatabasePage() {
  const firestore = useFirestore();

  const municipalitiesQuery = useMemoFirebase(() => {
    return collection(firestore, "municipalities");
  }, [firestore]);

  const {
    data: municipalities,
    isLoading,
    error,
  } = useCollection<Municipality>(municipalitiesQuery);

  const getScoreBadge = (score: number) => {
    if (score > 80)
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/50 dark:text-green-300">
          <TrendingUp className="mr-1 h-3 w-3" /> High
        </Badge>
      );
    if (score > 60)
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300">
          <TrendingUp className="mr-1 h-3 w-3" /> Medium
        </Badge>
      );
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-300">
        <TrendingDown className="mr-1 h-3 w-3" /> Low
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Municipality Database</CardTitle>
        <CardDescription>
          A pre-loaded database with requirements and insights for major US
          cities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <DatabaseSkeleton />}
        {error && <p className="text-red-500">Error: {error.message}</p>}
        {!isLoading && !error && municipalities && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Permit Probability Score</TableHead>
                <TableHead className="text-right">Website</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {municipalities.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.city}</TableCell>
                  <TableCell>{m.state}</TableCell>
                  <TableCell>
                    {getScoreBadge(m.permitProbabilityScore)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={m.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-primary hover:underline"
                    >
                      View <ExternalLink className="ml-1 h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DatabaseSkeleton() {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
          {[...Array(4)].map((_, i) => (
            <TableHead key={i}>
              <Skeleton className="h-5 w-24" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(10)].map((_, i) => (
          <TableRow key={i}>
            {[...Array(4)].map((_, j) => (
              <TableCell key={j}>
                <Skeleton className="h-5 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
        </TableBody>
      </Table>
    </div>
  );
}
