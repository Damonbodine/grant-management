"use client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface FunderFilterBarProps {
  search?: string;
  type?: string;
  onSearchChange?: (v: string) => void;
  onTypeChange?: (v: string) => void;
}

export function FunderFilterBar({ search, type, onSearchChange, onTypeChange }: FunderFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search funders..."
          value={search ?? ""}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={type ?? "all"} onValueChange={(v) => onTypeChange?.(v ?? "all")}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="Foundation">Foundation</SelectItem>
          <SelectItem value="Government">Government</SelectItem>
          <SelectItem value="Corporate">Corporate</SelectItem>
          <SelectItem value="Individual">Individual</SelectItem>
          <SelectItem value="Other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}