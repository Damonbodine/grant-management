"use client";
import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthedQuery } from "@/hooks/use-authed-query";

interface FunderEditFormProps {
  id: string;
}

export function FunderEditForm({ id }: FunderEditFormProps) {
  const router = useRouter();
  const updateFunder = useMutation(api.funders.updateFunder);
  const funder = useAuthedQuery(api.funders.getFunder, { id: id as Id<"funders"> });

  const [name, setName] = useState("");
  const [type, setType] = useState<"Foundation" | "Government" | "Corporate" | "Individual" | "Other">("Foundation");
  const [website, setWebsite] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (funder) {
      setName(funder.name ?? "");
      setType((funder.type as "Foundation" | "Government" | "Corporate" | "Individual" | "Other") ?? "Foundation");
      setWebsite(funder.website ?? "");
      setContactName(funder.contactName ?? "");
      setContactEmail(funder.contactEmail ?? "");
      setContactPhone(funder.contactPhone ?? "");
      setNotes(funder.notes ?? "");
    }
  }, [funder]);

  if (funder === undefined) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  if (funder === null) {
    return <p className="text-destructive">Funder not found.</p>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Funder name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateFunder({
        id: id as Id<"funders">,
        name: name.trim(),
        type,
        website: website.trim() || undefined,
        contactName: contactName.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      router.push(`/funders/${id}`);
    } catch (err: any) {
      setError(err.message ?? "Failed to update funder.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Funder</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Foundation or organization name" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="type">Type <span className="text-destructive">*</span></Label>
            <Select value={type} onValueChange={(v) => setType((v ?? "Foundation") as "Foundation" | "Government" | "Corporate" | "Individual" | "Other")}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Foundation">Foundation</SelectItem>
                <SelectItem value="Government">Government</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.org" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input id="contactPhone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+1 555-000-0000" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contact@funder.org" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Relationship history, preferences..." />
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