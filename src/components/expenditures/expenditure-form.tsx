"use client";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";
import { Id } from "@convex/_generated/dataModel";

export function ExpenditureForm({ awardId, onSuccess }: { awardId: string; onSuccess: () => void }) {
  const createExpenditure = useMutation(api.expenditures.createExpenditure);
  const users = useQuery(api.users.listUsers, {});
  const { user: clerkUser } = useUser();

  const [form, setForm] = useState({
    description: "", category: "Personnel", amount: "",
    date: "", vendor: "", receiptUrl: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = users?.find((u: typeof users[number]) => u.clerkId === clerkUser?.id);
    if (!currentUser) return;
    await createExpenditure({
      awardId: awardId as any,
      recordedById: currentUser._id,
      description: form.description,
      amount: Number(form.amount),
      category: form.category as any,
      date: new Date(form.date).getTime(),
      vendor: form.vendor || undefined,
      receiptUrl: form.receiptUrl || undefined,
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><Label>Description</Label><Input value={form.description} onChange={(e) => set("description", e.target.value)} required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => set("category", v ?? "Personnel")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["Personnel","Supplies","Travel","Equipment","Contractual","Indirect","Other"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Amount ($)</Label><Input type="number" step="0.01" value={form.amount} onChange={(e) => set("amount", e.target.value)} required /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required /></div>
        <div><Label>Vendor</Label><Input value={form.vendor} onChange={(e) => set("vendor", e.target.value)} /></div>
      </div>
      <div><Label>Receipt URL</Label><Input type="url" value={form.receiptUrl} onChange={(e) => set("receiptUrl", e.target.value)} /></div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
        <Button type="submit">Record Expenditure</Button>
      </div>
    </form>
  );
}