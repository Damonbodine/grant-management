"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GrantCreateForm() {
  const router = useRouter();
  const createGrant = useMutation(api.grants.createGrant);
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
        ? focusAreas.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      await createGrant({
        name: title.trim(),
        funderId: funderId as any,
        deadline: new Date(deadline).getTime(),
        status,
        category: "General Operating",
        isRecurring: false,
        eligibilityRequirements: eligibilityCriteria.trim() || undefined,
      });
      router.push("/grants");
    } catch (err: any) {
      setError(err.message ?? "Failed to create grant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Grant</CardTitle>
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
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Grant"}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}