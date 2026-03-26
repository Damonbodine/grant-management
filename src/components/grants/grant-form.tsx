"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Id } from "@convex/_generated/dataModel";

interface GrantFormProps {
  grantId?: Id<"grants">;
  onSuccess: () => void;
}

export function GrantForm({ grantId, onSuccess }: GrantFormProps) {
  const grant = useQuery(api.grants.getGrant, grantId ? { id: grantId } : "skip");
  const funders = useQuery(api.funders.listFunders, {});
  const createGrant = useMutation(api.grants.createGrant);
  const updateGrant = useMutation(api.grants.updateGrant);

  const [form, setForm] = useState({
    name: "", funderId: "", category: "Program", status: "Open",
    amountMin: "", amountMax: "", deadline: "", isRecurring: false,
    eligibilityRequirements: "", description: "",
  });

  useEffect(() => {
    if (grant) {
      setForm({
        name: grant.name,
        funderId: grant.funderId,
        category: grant.category,
        status: grant.status,
        amountMin: grant.amountMin?.toString() ?? "",
        amountMax: grant.amountMax?.toString() ?? "",
        deadline: new Date(grant.deadline).toISOString().split("T")[0],
        isRecurring: grant.isRecurring,
        eligibilityRequirements: grant.eligibilityRequirements ?? "",
        description: grant.description ?? "",
      });
    }
  }, [grant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const deadlineMs = new Date(form.deadline).getTime();
    if (grantId) {
      await updateGrant({ id: grantId, name: form.name, category: form.category as any, status: form.status as any, deadline: deadlineMs, amountMin: form.amountMin ? Number(form.amountMin) : undefined, amountMax: form.amountMax ? Number(form.amountMax) : undefined, eligibilityRequirements: form.eligibilityRequirements || undefined, description: form.description || undefined, isRecurring: form.isRecurring });
    } else {
      await createGrant({ funderId: form.funderId as Id<"funders">, name: form.name, category: form.category as any, status: form.status as any, deadline: deadlineMs, isRecurring: form.isRecurring, amountMin: form.amountMin ? Number(form.amountMin) : undefined, amountMax: form.amountMax ? Number(form.amountMax) : undefined, eligibilityRequirements: form.eligibilityRequirements || undefined, description: form.description || undefined });
    }
    onSuccess();
  };

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><Label>Grant Name</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
      {!grantId && (
        <div><Label>Funder</Label>
          <Select value={form.funderId} onValueChange={(v) => set("funderId", v ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select funder" /></SelectTrigger>
            <SelectContent>{funders?.map((f: typeof funders[number]) => <SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => set("category", v ?? "Program")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["General Operating","Program","Capital","Capacity Building","Research","Emergency","Other"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div><Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v ?? "Open")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Researching","Upcoming","Open","Closed","Archived"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div><Label>Min Amount</Label><Input type="number" value={form.amountMin} onChange={(e) => set("amountMin", e.target.value)} placeholder="0" /></div>
        <div><Label>Max Amount</Label><Input type="number" value={form.amountMax} onChange={(e) => set("amountMax", e.target.value)} placeholder="0" /></div>
        <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} required /></div>
      </div>
      <div><Label>Eligibility Requirements</Label><Textarea value={form.eligibilityRequirements} onChange={(e) => set("eligibilityRequirements", e.target.value)} rows={3} /></div>
      <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} /></div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
        <Button type="submit" className="bg-primary text-primary-foreground">{grantId ? "Save Changes" : "Create Grant"}</Button>
      </div>
    </form>
  );
}