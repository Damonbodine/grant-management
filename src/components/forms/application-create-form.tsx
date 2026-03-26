"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthedQuery } from "@/hooks/use-authed-query";

export function ApplicationCreateForm() {
  const router = useRouter();
  const createApplication = useMutation(api.applications.createApplication);
  const grants = useAuthedQuery(api.grants.listGrants, {});
  const users = useAuthedQuery(api.users.listUsers, {});

  const [title, setTitle] = useState("");
  const [grantId, setGrantId] = useState("");
  const [leadWriterId, setLeadWriterId] = useState("");
  const [requestedAmount, setRequestedAmount] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Critical">("Medium");
  const [projectSummary, setProjectSummary] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !grantId || !requestedAmount || !leadWriterId) {
      setError("Please fill in all required fields (Title, Grant, Lead Writer, Requested Amount).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createApplication({
        title: title.trim(),
        grantId: grantId as Id<"grants">,
        leadWriterId: leadWriterId as Id<"users">,
        requestedAmount: parseFloat(requestedAmount),
        priority,
        projectSummary: projectSummary.trim() || undefined,
        tags: tags.trim() || undefined,
      });
      router.push("/applications");
    } catch (err: any) {
      setError(err.message ?? "Failed to create application.");
    } finally {
      setLoading(false);
    }
  }

  const writers = users?.filter((u) => u.role === "GrantWriter" || u.role === "GrantManager" || u.role === "Admin");

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Application</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Application title / project name" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="grantId">Grant <span className="text-destructive">*</span></Label>
            <Select value={grantId} onValueChange={(v) => setGrantId(v ?? "")}>
              <SelectTrigger id="grantId">
                <SelectValue placeholder="Select grant" />
              </SelectTrigger>
              <SelectContent>
                {grants?.map((g) => (
                  <SelectItem key={g._id} value={g._id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="leadWriterId">Lead Writer <span className="text-destructive">*</span></Label>
            <Select value={leadWriterId} onValueChange={(v) => setLeadWriterId(v ?? "")}>
              <SelectTrigger id="leadWriterId">
                <SelectValue placeholder="Assign a lead writer" />
              </SelectTrigger>
              <SelectContent>
                {writers?.map((u) => (
                  <SelectItem key={u._id} value={u._id}>{u.name} ({u.role})</SelectItem>
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
              <Label htmlFor="priority">Priority <span className="text-destructive">*</span></Label>
              <Select value={priority} onValueChange={(v) => setPriority((v ?? "Medium") as "Low" | "Medium" | "High" | "Critical")}>
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
            <Label htmlFor="projectSummary">Project Summary</Label>
            <Textarea id="projectSummary" value={projectSummary} onChange={(e) => setProjectSummary(e.target.value)} rows={4} placeholder="Brief summary of proposed project..." />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="health-equity, education (comma-separated)" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Application"}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
