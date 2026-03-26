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

interface ReportCreateFormProps {
  awardId: string;
}

export function ReportCreateForm({ awardId }: ReportCreateFormProps) {
  const router = useRouter();
  const createReport = useMutation(api.reports.createReport);
  const currentUser = useAuthedQuery(api.users.getCurrentUser);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"Progress" | "Financial" | "Final" | "Interim">("Progress");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dueDate || !periodStart || !periodEnd) {
      setError("Please fill in all required fields (Title, Period Start, Period End, Due Date).");
      return;
    }
    if (!currentUser) {
      setError("User not loaded. Please try again.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createReport({
        awardId: awardId as Id<"awards">,
        authorId: currentUser._id,
        title: title.trim(),
        type,
        periodStart: new Date(periodStart).getTime(),
        periodEnd: new Date(periodEnd).getTime(),
        dueDate: new Date(dueDate).getTime(),
        content: content.trim() || "",
      });
      router.push(`/awards/${awardId}/reports`);
    } catch (err: any) {
      setError(err.message ?? "Failed to create report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Report</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Report title" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="type">Type <span className="text-destructive">*</span></Label>
            <Select value={type} onValueChange={(v) => setType((v ?? "Progress") as typeof type)}>
              <SelectTrigger id="type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Progress">Progress</SelectItem>
                <SelectItem value="Financial">Financial</SelectItem>
                <SelectItem value="Final">Final</SelectItem>
                <SelectItem value="Interim">Interim</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="periodStart">Period Start <span className="text-destructive">*</span></Label>
              <Input id="periodStart" type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="periodEnd">Period End <span className="text-destructive">*</span></Label>
              <Input id="periodEnd" type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dueDate">Due Date <span className="text-destructive">*</span></Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="content">Narrative Content <span className="text-destructive">*</span></Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="Report narrative and findings..." />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Report"}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
