"use client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface ApplicationFilterBarProps {
  stage?: string;
  priority?: string;
  search?: string;
  onStageChange?: (v: string) => void;
  onPriorityChange?: (v: string) => void;
  onSearchChange?: (v: string) => void;
}

export function ApplicationFilterBar({ stage, priority, search, onStageChange, onPriorityChange, onSearchChange }: ApplicationFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search applications..." value={search ?? ""} onChange={(e) => onSearchChange?.(e.target.value)} className="pl-9" />
      </div>
      <Select value={stage ?? "all"} onValueChange={(v) => onStageChange?.(v ?? "all")}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Stage" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stages</SelectItem>
          {["Draft","InReview","Submitted","UnderFunderReview","Awarded","Declined","Withdrawn"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={priority ?? "all"} onValueChange={(v) => onPriorityChange?.(v ?? "all")}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          {["Low","Medium","High","Critical"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}