"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Plus } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Id } from "@convex/_generated/dataModel";
import { format } from "date-fns";

export function TaskChecklist({ applicationId }: { applicationId: string }) {
  const tasks = useQuery(api.applicationTasks.listApplicationTasks, { applicationId: applicationId as any });
  const toggleTask = useMutation(api.applicationTasks.toggleTaskComplete);
  const createTask = useMutation(api.applicationTasks.createApplicationTask);
  const deleteTask = useMutation(api.applicationTasks.deleteApplicationTask);
  const users = useQuery(api.users.listUsers, {});
  const { user: clerkUser } = useUser();
  const [newTitle, setNewTitle] = useState("");

  if (tasks === undefined) return <Skeleton className="h-48 w-full" />;

  const completedCount = tasks.filter((t: typeof tasks[number]) => t.isCompleted).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const currentUser = users?.find((u: typeof users[number]) => u.clerkId === clerkUser?.id);

  const handleToggle = (taskId: Id<"applicationTasks">) => {
    if (!currentUser) return;
    toggleTask({ id: taskId, completedById: currentUser._id });
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await createTask({ applicationId: applicationId as any, title: newTitle, category: "Other", sortOrder: tasks.length });
    setNewTitle("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Tasks ({completedCount}/{tasks.length})</CardTitle>
          <span className="text-sm text-muted-foreground">{progress}% complete</span>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.map((task: typeof tasks[number]) => (
          <div key={task._id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/40">
            <Checkbox
              checked={task.isCompleted}
              onCheckedChange={() => handleToggle(task._id)}
            />
            <div className="flex-1">
              <p className={`text-sm ${task.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</p>
              {task.dueDate && <p className="text-xs text-muted-foreground">{format(new Date(task.dueDate), "MMM d")}</p>}
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteTask({ id: task._id })}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2 pt-2">
          <Input placeholder="Add task..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          <Button size="icon" variant="outline" onClick={handleAdd}><Plus className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}