"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FunderCreateForm() {
  const router = useRouter();
  const createFunder = useMutation(api.funders.createFunder);

  const [name, setName] = useState("");
  const [type, setType] = useState<string>("Foundation");
  const [relationshipStatus, setRelationshipStatus] = useState<string>("New");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [focusAreas, setFocusAreas] = useState("");
  const [averageAwardSize, setAverageAwardSize] = useState("");
  const [grantCycle, setGrantCycle] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Funder name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createFunder({
        name: name.trim(),
        type: type as "Foundation" | "Government" | "Corporate" | "Individual" | "Other",
        relationshipStatus: relationshipStatus as "New" | "Active" | "Cultivating" | "Dormant" | "Declined",
        website: website.trim() || undefined,
        address: address.trim() || undefined,
        contactName: contactName.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        focusAreas: focusAreas.trim() || undefined,
        averageAwardSize: averageAwardSize ? parseFloat(averageAwardSize) : undefined,
        grantCycle: grantCycle.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      router.push("/funders");
    } catch (err: any) {
      setError(err.message ?? "Failed to create funder.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Funder</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Foundation or organization name" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="type">Type <span className="text-destructive">*</span></Label>
              <Select value={type} onValueChange={(v) => setType(v ?? "Foundation")}>
                <SelectTrigger id="type"><SelectValue /></SelectTrigger>
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
              <Label htmlFor="relationshipStatus">Relationship Status <span className="text-destructive">*</span></Label>
              <Select value={relationshipStatus} onValueChange={(v) => setRelationshipStatus(v ?? "New")}>
                <SelectTrigger id="relationshipStatus"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Cultivating">Cultivating</SelectItem>
                  <SelectItem value="Dormant">Dormant</SelectItem>
                  <SelectItem value="Declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.org" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="address">Mailing Address</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City, ST 12345" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contact@funder.org" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input id="contactPhone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+1 555-000-0000" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="focusAreas">Focus Areas</Label>
            <Input id="focusAreas" value={focusAreas} onChange={(e) => setFocusAreas(e.target.value)} placeholder="Health equity, education, housing (comma-separated)" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="averageAwardSize">Average Award Size ($)</Label>
              <Input id="averageAwardSize" type="number" min={0} step="0.01" value={averageAwardSize} onChange={(e) => setAverageAwardSize(e.target.value)} placeholder="50000" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="grantCycle">Grant Cycle</Label>
              <Input id="grantCycle" value={grantCycle} onChange={(e) => setGrantCycle(e.target.value)} placeholder="Annual, Spring deadline" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Relationship history, preferences..." />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Funder"}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
