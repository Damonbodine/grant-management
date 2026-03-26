"use client";

import type { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const currentUser = useQuery(api.users.getCurrentUser);

  // Still loading
  if (currentUser === undefined) {
    return null;
  }

  // Not found or role not permitted
  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-md">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view this page. Required role:{" "}
            <span className="font-semibold">{allowedRoles.join(" or ")}</span>.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}