"use client";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pin, Trash2, Send } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Id } from "@convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import { useAuthedQuery } from "@/hooks/use-authed-query";

export function NotesFeed({ applicationId }: { applicationId: string }) {
  const notes = useAuthedQuery(api.applicationNotes.getNotesByApplication, { applicationId: applicationId as Id<"applications"> });
  const users = useAuthedQuery(api.users.listUsers, {});
  const createNote = useMutation(api.applicationNotes.createApplicationNote);
  const deleteNote = useMutation(api.applicationNotes.deleteApplicationNote);
  const updateNote = useMutation(api.applicationNotes.updateApplicationNote);
  const { user: clerkUser } = useUser();
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  if (notes === undefined) return <Skeleton className="h-48 w-full" />;

  const currentUser = users?.find((u: typeof users[number]) => u.clerkId === clerkUser?.id);

  const handleSubmit = async () => {
    if (!content.trim() || !currentUser) return;
    await createNote({ applicationId: applicationId as Id<"applications">, authorId: currentUser._id, content, isPinned: false, isInternal });
    setContent("");
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
            {notes.map((note: typeof notes[number]) => {
              const author = users?.find((u: typeof users[number]) => u._id === note.authorId);
              return (
                <div key={note._id} className={`p-3 rounded-md border ${note.isPinned ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-foreground">{author?.name ?? "Unknown"}</span>
                        {note.isPinned && <Badge className="text-xs h-4 bg-primary/20 text-primary">Pinned</Badge>}
                        {note.isInternal && <Badge variant="outline" className="text-xs h-4">Internal</Badge>}
                        <span className="text-xs text-muted-foreground ml-auto">{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
                      </div>
                      <p className="text-sm text-foreground">{note.content}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateNote({ id: note._id, isPinned: !note.isPinned })}>
                        <Pin className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteNote({ id: note._id })}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <div className="space-y-2">
          <Textarea placeholder="Add a note..." value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="rounded" />
              Internal only
            </label>
            <Button size="sm" onClick={handleSubmit} disabled={!content.trim()}>
              <Send className="h-4 w-4 mr-1" /> Add Note
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}