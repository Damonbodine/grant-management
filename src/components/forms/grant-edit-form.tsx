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

interface GrantEditFormProps {
  id: string;
}

export function GrantEditForm({ id }: GrantEditFormProps) {
  const router = useRouter();
  const updateGrant = useMutation(api.grants.updateGrant);
  const grant = useQuery(api.grants.getGrant, { id: id as Id<"grants"> });
  const funders = useQuery(api.funders.listFunders, {});

  const [title, setTitle] = useState("");
  const [funderId, setFunderId] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<"Open" | "Closed" | "Archived">("Open");
  const [focusAreas, setFocusAreas] = useState("");
  const [eligibilityCriteria, setEligibilityCriteria] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (grant) {
      setTitle((grant as any).name ?? (grant as any).title ?? "");
      setFunderId(grant.funderId ?? "");
      setAmount((grant.amountMax ?? grant.amountMin ?? 0).toString());
      setDeadline(grant.deadline ? new Date(grant.deadline).toISOString().split("T")[0] : "");
      setStatus((grant.status as "Open" | "Closed" | "Archived") ?? "Open");
      setFocusAreas("");
      setEligibilityCriteria(grant.eligibilityRequirements ?? "");
      setNotes("");
    }
  }, [grant]);

  if (grant === undefined) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  if (grant === null) {
    return <p className="text-destructive">Grant not found.</p>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !funderId || !amount || !deadline) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const focusAreasArray = focusAreas
        ? focusAreas.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];
      await updateGrant({
        id: id as Id<"grants">,
        name: title.trim(),
        deadline: new Date(deadline).getTime(),
        status,
        amountMax: parseFloat(amount) || undefined,
        eligibilityRequirements: eligibilityCriteria.trim() || undefined,
      });
      router.push(`/grants/${id}`);
    } catch (err: any) {
      setError(err.message ?? "Failed to update grant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Grant</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Grant title" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="funderId">Funder <span className="text-destructive">*</span></Label>
            <Select value={funderId} onValueChange={(v) => setFunderId(v ?? "")}>
              <SelectTrigger id="funderId">
                <SelectValue placeholder="Select funder" />
              </SelectTrigger>
              <SelectContent>
                {funders?.map((f: typeof funders[number]) => (
                  <SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="amount">Amount ($) <span className="text-destructive">*</span></Label>
              <Input id="amount" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="deadline">Deadline <span className="text-destructive">*</span></Label>
              <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="status">Status <span className="text-destructive">*</span></Label>
            <Select value={status} onValueChange={(v) => setStatus((v ?? "Open") as "Open" | "Closed" | "Archived")}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="focusAreas">Focus Areas</Label>
            <Input id="focusAreas" value={focusAreas} onChange={(e) => setFocusAreas(e.target.value)} placeholder="e.g. Education, Health (comma-separated)" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="eligibilityCriteria">Eligibility Criteria</Label>
            <Textarea id="eligibilityCriteria" value={eligibilityCriteria} onChange={(e) => setEligibilityCriteria(e.target.value)} rows={3} placeholder="Who is eligible to apply..." />
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