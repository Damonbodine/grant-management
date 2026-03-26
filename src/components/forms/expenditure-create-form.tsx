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

interface ExpenditureCreateFormProps {
  awardId: string;
}

export function ExpenditureCreateForm({ awardId }: ExpenditureCreateFormProps) {
  const router = useRouter();
  const createExpenditure = useMutation(api.expenditures.createExpenditure);

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"Personnel" | "Supplies" | "Travel" | "Indirect" | "Other">("Personnel");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [vendor, setVendor] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !amount || !date) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await (createExpenditure as any)({
        awardId: awardId,
        description: description.trim(),
        category,
        amount: parseFloat(amount),
        date: new Date(date).getTime(),
        vendor: vendor.trim() || undefined,
        receiptUrl: receiptUrl.trim() || undefined,
      });
      router.push(`/awards/${awardId}/expenditures`);
    } catch (err: any) {
      setError(err.message ?? "Failed to create expenditure.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Record Expenditure</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What was this expense for?" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
            <Select value={category} onValueChange={(v) => setCategory((v ?? "Personnel") as typeof category)}>
              <SelectTrigger id="category"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Personnel">Personnel</SelectItem>
                <SelectItem value="Supplies">Supplies</SelectItem>
                <SelectItem value="Travel">Travel</SelectItem>
                <SelectItem value="Indirect">Indirect</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="amount">Amount ($) <span className="text-destructive">*</span></Label>
              <Input id="amount" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="vendor">Vendor</Label>
            <Input id="vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Vendor or payee name" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="receiptUrl">Receipt URL</Label>
            <Input id="receiptUrl" type="url" value={receiptUrl} onChange={(e) => setReceiptUrl(e.target.value)} placeholder="https://receipts.example.com/doc" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Additional details..." />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Record Expenditure"}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}