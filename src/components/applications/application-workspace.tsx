"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskChecklist } from "@/components/applications/task-checklist";
import { NotesFeed } from "@/components/applications/notes-feed";
import { Id } from "@convex/_generated/dataModel";

export function ApplicationWorkspace({ applicationId }: { applicationId: string }) {
  return (
    <Tabs defaultValue="tasks" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
      </TabsList>
      <TabsContent value="tasks">
        <TaskChecklist applicationId={applicationId} />
      </TabsContent>
      <TabsContent value="notes">
        <NotesFeed applicationId={applicationId} />
      </TabsContent>
    </Tabs>
  );
}