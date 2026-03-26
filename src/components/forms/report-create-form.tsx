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

interface ReportCreateFormProps {
  awardId: string;
}

export function ReportCreateForm({ awardId }: ReportCreateFormProps) {
  const router = useRouter();
  const createReport = useMutation(api.reports.createReport);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"Progress" | "Financial" | "Final" | "Interim">("Progress");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<"Draft" | "Submitted" | "Accepted" | "Rejected">("Draft");
  const [content, setContent] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await (createReport as any)({
        awardId: awardId,
        title: title.trim(),
        type,
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
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-1">
              <Label htmlFor="dueDate">Due Date <span className="text-destructive">*</span></Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="status">Status <span className="text-destructive">*</span></Label>
            <Select value={status} onValueChange={(v) => setStatus((v ?? "Draft") as typeof status)}>
              <SelectTrigger id="status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="content">Narrative Content</Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="Report narrative and findings..." />
          </div>
          <div className="space-y-1">
            <Label htmlFor="attachmentUrl">Attachment URL</Label>
            <Input id="attachmentUrl" type="url" value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} placeholder="https://docs.example.com/report.pdf" />
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