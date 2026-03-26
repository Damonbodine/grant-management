"use client";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Id } from "@convex/_generated/dataModel";
import { useAuthedQuery } from "@/hooks/use-authed-query";

export function FunderForm({ funderId, onSuccess }: { funderId?: Id<"funders">; onSuccess: () => void }) {
  const funder = useAuthedQuery(api.funders.getFunder, funderId ? { id: funderId } : "skip");
  const createFunder = useMutation(api.funders.createFunder);
  const updateFunder = useMutation(api.funders.updateFunder);

  const [form, setForm] = useState({
    name: "", type: "Foundation", relationshipStatus: "New",
    contactName: "", contactEmail: "", contactPhone: "",
    website: "", notes: "",
  });

  useEffect(() => {
    if (funder) {
      setForm({
        name: funder.name, type: funder.type, relationshipStatus: funder.relationshipStatus,
        contactName: funder.contactName ?? "", contactEmail: funder.contactEmail ?? "",
        contactPhone: funder.contactPhone ?? "", website: funder.website ?? "", notes: funder.notes ?? "",
      });
    }
  }, [funder]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (funderId) {
      await updateFunder({ id: funderId, ...form, type: form.type as "Foundation" | "Government" | "Corporate" | "Individual" | "Other", relationshipStatus: form.relationshipStatus as "New" | "Active" | "Cultivating" | "Dormant" | "Declined" });
    } else {
      await createFunder({ ...form, type: form.type as "Foundation" | "Government" | "Corporate" | "Individual" | "Other", relationshipStatus: form.relationshipStatus as "New" | "Active" | "Cultivating" | "Dormant" | "Declined" });
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><Label>Funder Name</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Type</Label>
          <Select value={form.type} onValueChange={(v) => set("type", v ?? "Foundation")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["Foundation","Government","Corporate","Individual","Other"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Relationship Status</Label>
          <Select value={form.relationshipStatus} onValueChange={(v) => set("relationshipStatus", v ?? "New")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["New","Active","Cultivating","Dormant","Declined"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Contact Name</Label><Input value={form.contactName} onChange={(e) => set("contactName", e.target.value)} /></div>
        <div><Label>Contact Email</Label><Input type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Phone</Label><Input type="tel" value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} /></div>
        <div><Label>Website</Label><Input type="url" value={form.website} onChange={(e) => set("website", e.target.value)} /></div>
      </div>
      <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} /></div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
        <Button type="submit">{funderId ? "Save Changes" : "Create Funder"}</Button>
      </div>
    </form>
  );
}