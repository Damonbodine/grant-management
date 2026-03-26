"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthedQuery } from "@/hooks/use-authed-query";

interface ApplicationNoteFormProps {
  applicationId: string;
  onSuccess?: () => void;
}

export function ApplicationNoteForm({ applicationId, onSuccess }: ApplicationNoteFormProps) {
  const createNote = useMutation(api.applicationNotes.createApplicationNote);
  const currentUser = useAuthedQuery(api.users.getCurrentUser);

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError("Note content is required.");
      return;
    }
    if (!currentUser) {
      setError("Not authenticated.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createNote({
        applicationId: applicationId as Id<"applications">,
        authorId: currentUser._id,
        content: content.trim(),
        isPinned: false,
        isInternal: false,
      });
      setContent("");
      onSuccess?.();
    } catch (err: any) {
      setError(err.message ?? "Failed to add note.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="note-content">Add Note</Label>
        <Textarea
          id="note-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Write an internal note..."
          className="resize-none"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={loading || !content.trim()}>
          {loading ? "Posting..." : "Post Note"}
        </Button>
      </div>
    </form>
  );
}