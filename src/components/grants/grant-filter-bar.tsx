"use client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface GrantFilterBarProps {
  status?: string;
  category?: string;
  search?: string;
  onStatusChange?: (v: string) => void;
  onCategoryChange?: (v: string) => void;
  onSearchChange?: (v: string) => void;
}

export function GrantFilterBar({ status, category, search, onStatusChange, onCategoryChange, onSearchChange }: GrantFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search grants..."
          value={search ?? ""}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={status ?? "all"} onValueChange={(v) => onStatusChange?.(v ?? "all")}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="Researching">Researching</SelectItem>
          <SelectItem value="Upcoming">Upcoming</SelectItem>
          <SelectItem value="Open">Open</SelectItem>
          <SelectItem value="Closed">Closed</SelectItem>
          <SelectItem value="Archived">Archived</SelectItem>
        </SelectContent>
      </Select>
      <Select value={category ?? "all"} onValueChange={(v) => onCategoryChange?.(v ?? "all")}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
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
  );
}