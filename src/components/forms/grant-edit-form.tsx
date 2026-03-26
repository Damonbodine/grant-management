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
import { Switch } from "@/components/ui/switch";
import { useAuthedQuery } from "@/hooks/use-authed-query";

interface GrantEditFormProps {
  id: string;
}

export function GrantEditForm({ id }: GrantEditFormProps) {
  const router = useRouter();
  const updateGrant = useMutation(api.grants.updateGrant);
  const grant = useAuthedQuery(api.grants.getGrant, { id: id as Id<"grants"> });
  const funders = useAuthedQuery(api.funders.listFunders, {});

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("General Operating");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [eligibilityRequirements, setEligibilityRequirements] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [openDate, setOpenDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [announcementDate, setAnnouncementDate] = useState("");
  const [grantPeriodMonths, setGrantPeriodMonths] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [matchRequired, setMatchRequired] = useState(false);
  const [matchPercentage, setMatchPercentage] = useState("");
  const [status, setStatus] = useState<string>("Open");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (grant) {
      setName(grant.name ?? "");
      setDescription(grant.description ?? "");
      setCategory(grant.category ?? "General Operating");
      setAmountMin(grant.amountMin?.toString() ?? "");
      setAmountMax(grant.amountMax?.toString() ?? "");
      setEligibilityRequirements(grant.eligibilityRequirements ?? "");
      setApplicationUrl(grant.applicationUrl ?? "");
      setOpenDate(grant.openDate ? new Date(grant.openDate).toISOString().split("T")[0] : "");
      setDeadline(grant.deadline ? new Date(grant.deadline).toISOString().split("T")[0] : "");
      setAnnouncementDate(grant.announcementDate ? new Date(grant.announcementDate).toISOString().split("T")[0] : "");
      setGrantPeriodMonths(grant.grantPeriodMonths?.toString() ?? "");
      setIsRecurring(grant.isRecurring ?? false);
      setMatchRequired(grant.matchRequired ?? false);
      setMatchPercentage(grant.matchPercentage?.toString() ?? "");
      setStatus(grant.status ?? "Open");
    }
  }, [grant]);

  if (grant === undefined) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  if (grant === null) {
    return <p className="text-destructive">Grant not found.</p>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !deadline) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateGrant({
        id: id as Id<"grants">,
        name: name.trim(),
        description: description.trim() || undefined,
        category: category as "General Operating" | "Program" | "Capital" | "Capacity Building" | "Research" | "Emergency" | "Other",
        amountMin: amountMin ? parseFloat(amountMin) : undefined,
        amountMax: amountMax ? parseFloat(amountMax) : undefined,
        eligibilityRequirements: eligibilityRequirements.trim() || undefined,
        applicationUrl: applicationUrl.trim() || undefined,
        openDate: openDate ? new Date(openDate).getTime() : undefined,
        deadline: new Date(deadline).getTime(),
        announcementDate: announcementDate ? new Date(announcementDate).getTime() : undefined,
        grantPeriodMonths: grantPeriodMonths ? parseFloat(grantPeriodMonths) : undefined,
        isRecurring,
        matchRequired: matchRequired || undefined,
        matchPercentage: matchPercentage ? parseFloat(matchPercentage) : undefined,
        status: status as "Researching" | "Upcoming" | "Open" | "Closed" | "Archived",
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
            <Label htmlFor="name">Grant Name <span className="text-destructive">*</span></Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Grant program name" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Grant description and purpose" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
              <Select value={category} onValueChange={(v) => setCategory(v ?? "General Operating")}>
                <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="General Operating">General Operating</SelectItem>
                  <SelectItem value="Program">Program</SelectItem>
                  <SelectItem value="Capital">Capital</SelectItem>
                  <SelectItem value="Capacity Building">Capacity Building</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="status">Status <span className="text-destructive">*</span></Label>
              <Select value={status} onValueChange={(v) => setStatus(v ?? "Open")}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Researching">Researching</SelectItem>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="amountMin">Minimum Amount ($)</Label>
              <Input id="amountMin" type="number" min={0} step="0.01" value={amountMin} onChange={(e) => setAmountMin(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="amountMax">Maximum Amount ($)</Label>
              <Input id="amountMax" type="number" min={0} step="0.01" value={amountMax} onChange={(e) => setAmountMax(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="openDate">Open Date</Label>
              <Input id="openDate" type="date" value={openDate} onChange={(e) => setOpenDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="deadline">Deadline <span className="text-destructive">*</span></Label>
              <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="announcementDate">Announcement Date</Label>
              <Input id="announcementDate" type="date" value={announcementDate} onChange={(e) => setAnnouncementDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="grantPeriodMonths">Grant Period (months)</Label>
              <Input id="grantPeriodMonths" type="number" min={1} value={grantPeriodMonths} onChange={(e) => setGrantPeriodMonths(e.target.value)} placeholder="12" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="applicationUrl">Application URL</Label>
              <Input id="applicationUrl" type="url" value={applicationUrl} onChange={(e) => setApplicationUrl(e.target.value)} placeholder="https://funder.org/apply" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="eligibilityRequirements">Eligibility Requirements</Label>
            <Textarea id="eligibilityRequirements" value={eligibilityRequirements} onChange={(e) => setEligibilityRequirements(e.target.value)} rows={3} placeholder="Who is eligible to apply..." />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch id="isRecurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
              <Label htmlFor="isRecurring">Recurring Grant</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="matchRequired" checked={matchRequired} onCheckedChange={setMatchRequired} />
              <Label htmlFor="matchRequired">Match Required</Label>
            </div>
            {matchRequired && (
              <div className="space-y-1">
                <Label htmlFor="matchPercentage">Match %</Label>
                <Input id="matchPercentage" type="number" min={0} max={100} value={matchPercentage} onChange={(e) => setMatchPercentage(e.target.value)} placeholder="25" className="w-24" />
              </div>
            )}
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
