"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ApplicationTaskFormProps {
  applicationId: string;
  onSuccess?: () => void;
}

export function ApplicationTaskForm({ applicationId, onSuccess }: ApplicationTaskFormProps) {
  const createTask = useMutation(api.applicationTasks.createApplicationTask);
  const users = useQuery(api.users.listUsers, {});

  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Critical">("Medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await (createTask as any)({
        applicationId: applicationId,
        title: title.trim(),
        category: "Other",
        sortOrder: 0,
        assigneeId: assigneeId || undefined,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
      });
      setTitle("");
      setAssigneeId("");
      setDueDate("");
      setPriority("Medium");
      onSuccess?.();
    } catch (err: any) {
      setError(err.message ?? "Failed to create task.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="task-title">Task Title <span className="text-destructive">*</span></Label>
        <Input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="task-assignee">Assignee</Label>
          <Select value={assigneeId} onValueChange={(v) => setAssigneeId(v ?? "")}>
            <SelectTrigger id="task-assignee"><SelectValue placeholder="Assign to..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {users?.map((u: typeof users[number]) => (
                <SelectItem key={u._id} value={u._id}>{u.name ?? u.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="task-due">Due Date</Label>
          <Input id="task-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="task-priority">Priority <span className="text-destructive">*</span></Label>
        <Select value={priority} onValueChange={(v) => setPriority((v ?? "Low") as "Low" | "Medium" | "High" | "Critical")}>
          <SelectTrigger id="task-priority"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={loading || !title.trim()}>
          {loading ? "Adding..." : "Add Task"}
        </Button>
      </div>
    </form>
  );
}