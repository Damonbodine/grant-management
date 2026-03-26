"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";
import { Id } from "@convex/_generated/dataModel";

export function ReportForm({ awardId, onSuccess }: { awardId: string; onSuccess: () => void }) {
  const createReport = useMutation(api.reports.createReport);
  const users = useQuery(api.users.listUsers, {});
  const { user: clerkUser } = useUser();

  const [form, setForm] = useState({
    title: "", type: "Progress", dueDate: "",
    periodStart: "", periodEnd: "", content: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = users?.find((u: typeof users[number]) => u.clerkId === clerkUser?.id);
    if (!currentUser) return;
    await createReport({
      awardId: awardId as any,
      authorId: currentUser._id,
      title: form.title,
      type: form.type as any,
      dueDate: new Date(form.dueDate).getTime(),
      periodStart: new Date(form.periodStart).getTime(),
      periodEnd: new Date(form.periodEnd).getTime(),
      content: form.content,
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><Label>Report Title</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Type</Label>
          <Select value={form.type} onValueChange={(v) => set("type", v ?? "Progress")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["Progress","Financial","Final","Interim"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} required /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Period Start</Label><Input type="date" value={form.periodStart} onChange={(e) => set("periodStart", e.target.value)} required /></div>
        <div><Label>Period End</Label><Input type="date" value={form.periodEnd} onChange={(e) => set("periodEnd", e.target.value)} required /></div>
      </div>
      <div><Label>Narrative Content</Label><Textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={6} required /></div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
        <Button type="submit">Create Report</Button>
      </div>
    </form>
  );
}