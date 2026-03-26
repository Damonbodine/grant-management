"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ApplicationEditFormProps {
  id: string;
}

export function ApplicationEditForm({ id }: ApplicationEditFormProps) {
  const router = useRouter();
  const updateApplication = useMutation(api.applications.updateApplication);
  const application = useQuery(api.applications.getApplication, { id: id as Id<"applications"> });
  const grants = useQuery(api.grants.listGrants, {});
  const users = useQuery(api.users.listUsers, {});

  const [title, setTitle] = useState("");
  const [grantId, setGrantId] = useState("");
  const [assignedWriterId, setAssignedWriterId] = useState("");
  const [requestedAmount, setRequestedAmount] = useState("");
  const [stage, setStage] = useState<"Draft" | "InReview" | "Submitted" | "UnderFunderReview" | "Awarded" | "Declined">("Draft");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Critical">("Medium");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (application) {
      setTitle(application.title ?? "");
      setGrantId((application as any).grantId ?? "");
      setAssignedWriterId((application as any).assignedWriterId ?? "");
      setRequestedAmount(application.requestedAmount?.toString() ?? "");
      setStage((application.stage as typeof stage) ?? "Draft");
      setPriority((application.priority as typeof priority) ?? "Medium");
      setDeadline((application as any).deadline ? new Date((application as any).deadline).toISOString().split("T")[0] : "");
      setNotes((application as any).notes ?? "");
    }
  }, [application]);

  if (application === undefined) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  if (application === null) {
    return <p className="text-destructive">Application not found.</p>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !grantId || !requestedAmount) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateApplication({
        id: id as Id<"applications">,
        title: title.trim(),
        requestedAmount: parseFloat(requestedAmount),
        priority,
      });
      router.push(`/applications/${id}`);
    } catch (err: any) {
      setError(err.message ?? "Failed to update application.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Application</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Application title" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="grantId">Grant <span className="text-destructive">*</span></Label>
            <Select value={grantId} onValueChange={(v) => setGrantId(v ?? "")}>
              <SelectTrigger id="grantId"><SelectValue placeholder="Select grant" /></SelectTrigger>
              <SelectContent>
                {grants?.map((g: typeof grants[number]) => (
                  <SelectItem key={g._id} value={g._id}>{(g as any).name ?? g._id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="assignedWriterId">Lead Writer</Label>
            <Select value={assignedWriterId} onValueChange={(v) => setAssignedWriterId(v ?? "")}>
              <SelectTrigger id="assignedWriterId"><SelectValue placeholder="Assign a writer (optional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {users?.map((u: typeof users[number]) => (
                  <SelectItem key={u._id} value={u._id}>{u.name ?? u.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="requestedAmount">Requested Amount ($) <span className="text-destructive">*</span></Label>
              <Input id="requestedAmount" type="number" min={0} step="0.01" value={requestedAmount} onChange={(e) => setRequestedAmount(e.target.value)} placeholder="0.00" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="stage">Stage <span className="text-destructive">*</span></Label>
              <Select value={stage} onValueChange={(v) => setStage((v ?? "Draft") as typeof stage)}>
                <SelectTrigger id="stage"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="InReview">In Review</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="UnderFunderReview">Under Funder Review</SelectItem>
                  <SelectItem value="Awarded">Awarded</SelectItem>
                  <SelectItem value="Declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="priority">Priority <span className="text-destructive">*</span></Label>
              <Select value={priority} onValueChange={(v) => setPriority((v ?? "Low") as "Low" | "Medium" | "High" | "Critical")}>
                <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Internal notes..." />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}