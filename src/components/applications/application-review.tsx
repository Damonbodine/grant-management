"use client";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle, RotateCcw } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { useAuthedQuery } from "@/hooks/use-authed-query";

export function ApplicationReview({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const application = useAuthedQuery(api.applications.getApplication, { id: applicationId as Id<"applications"> });
  const grant = useAuthedQuery(api.grants.getGrant, application?.grantId ? { id: application.grantId } : "skip");
  const users = useAuthedQuery(api.users.listUsers, {});
  const approveApp = useMutation(api.applications.approveApplication);
  const returnToDraft = useMutation(api.applications.returnApplicationToDraft);
  const createNote = useMutation(api.applicationNotes.createApplicationNote);
  const { user: clerkUser } = useUser();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState<"approve" | "return">("approve");
  const [reason, setReason] = useState("");
  const [score, setScore] = useState("");

  if (application === undefined) return <Skeleton className="h-64 w-full" />;
  if (application === null) return <p className="text-muted-foreground">Application not found.</p>;

  const currentUser = users?.find((u: typeof users[number]) => u.clerkId === clerkUser?.id);

  const handleConfirm = async () => {
    if (!currentUser) return;
    if (action === "approve") {
      await approveApp({ id: applicationId as Id<"applications">, reviewedById: currentUser._id });
    } else {
      await returnToDraft({ id: applicationId as Id<"applications">, reason });
    }
    if (reason) {
      await createNote({ applicationId: applicationId as Id<"applications">, authorId: currentUser._id, content: reason, isPinned: false, isInternal: true });
    }
    setDialogOpen(false);
    router.push(`/applications/${applicationId}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Application Under Review</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Title</span><p className="font-medium mt-0.5">{application.title}</p></div>
          <div><span className="text-muted-foreground">Grant</span><p className="font-medium mt-0.5">{grant?.name ?? "—"}</p></div>
          <div><span className="text-muted-foreground">Requested</span><p className="font-medium mt-0.5">${application.requestedAmount.toLocaleString()}</p></div>
          <div><span className="text-muted-foreground">Stage</span><p className="font-medium mt-0.5">{application.stage}</p></div>
          {application.projectSummary && <div className="col-span-2"><span className="text-muted-foreground">Project Summary</span><p className="mt-0.5">{application.projectSummary}</p></div>}
        </CardContent>
      </Card>
      <div className="flex gap-3">
        <Button className="flex-1" onClick={() => { setAction("approve"); setDialogOpen(true); }}>
          <CheckCircle className="h-4 w-4 mr-2" /> Approve & Submit
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => { setAction("return"); setDialogOpen(true); }}>
          <RotateCcw className="h-4 w-4 mr-2" /> Return to Draft
        </Button>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action === "approve" ? "Approve Application" : "Return to Draft"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {action === "approve" && (
              <div><Label>Internal Score (1-10)</Label><Input type="number" min={1} max={10} value={score} onChange={(e) => setScore(e.target.value)} /></div>
            )}
            <div><Label>Notes (optional)</Label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder={action === "return" ? "Reason for returning..." : "Reviewer notes..."} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirm}>{action === "approve" ? "Confirm Approval" : "Confirm Return"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}