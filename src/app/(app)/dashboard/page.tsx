import {
    Activity,
    AlertTriangle,
    CalendarCheck,
    CheckCircle2,
  } from "lucide-react";
  
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
  import { mockPermits, type Permit } from "@/lib/data";
  import { Button } from "@/components/ui/button";
  
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
    const permits = mockPermits;
  
    const stats = {
      inReview: permits.filter((p) => p.status === "In Review").length,
      approved: permits.filter((p) => p.status === "Approved").length,
      rejected: permits.filter((p) => p.status === "Rejected").length,
      inspectionScheduled: permits.filter((p) => p.status === "Inspection Scheduled").length,
    };
  
    return (
      <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>In Review</CardDescription>
              <CardTitle className="text-4xl font-headline">{stats.inReview}</CardTitle>
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
              <CardTitle className="text-4xl font-headline">{stats.approved}</CardTitle>
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
              <CardTitle className="text-4xl font-headline">{stats.inspectionScheduled}</CardTitle>
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
              <CardTitle className="text-4xl font-headline">{stats.rejected}</CardTitle>
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
                {permits.map((permit) => (
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
                            statusConfig[permit.status].color
                          }`}
                        />
                        {permit.status}
                      </div>
                    </TableCell>
                    <TableCell>{permit.city}</TableCell>
                    <TableCell>{permit.submittedDate}</TableCell>
                    <TableCell>
                      {permit.status === 'Inspection Scheduled' && (
                          <Button size="sm" variant="outline">
                              <CalendarCheck className="mr-2 h-4 w-4"/>
                              Add to Calendar
                          </Button>
                      )}
                      {permit.status === 'Approved' && (
                          <Button size="sm" variant="outline">View Documents</Button>
                      )}
                       {permit.status === 'Rejected' && (
                          <Button size="sm" variant="destructive">Review Errors</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }
  