"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import {
  LayoutDashboard, FileText, Building2, ClipboardList,
  Trophy, Calendar, Bell, DollarSign
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/grants", label: "Grants", icon: FileText },
  { href: "/funders", label: "Funders", icon: Building2 },
  { href: "/applications", label: "Applications", icon: ClipboardList },
  { href: "/awards", label: "Awards", icon: Trophy },
  { href: "/deadlines", label: "Deadlines", icon: Calendar },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const convexUser = useQuery(api.users.listUsers, {});
  const unreadCount = useQuery(
    api.notifications.getUnreadNotificationCount,
    convexUser && convexUser.length > 0 ? { userId: convexUser[0]._id } : "skip"
  );

  return (
    <aside className="flex flex-col w-56 min-h-screen bg-sidebar border-r border-sidebar-border">
      <div className="px-4 py-5 border-b border-sidebar-border">
        <span className="text-sidebar-primary font-bold text-lg tracking-tight">GrantFlow</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{label}</span>
              {label === "Notifications" && unreadCount != null && unreadCount > 0 && (
                <Badge className="ml-auto h-5 min-w-5 text-xs bg-primary text-primary-foreground">
                  {unreadCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-sidebar-border flex items-center gap-3">
        <UserButton />
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-sidebar-accent-foreground truncate">{user?.fullName}</span>
          <span className="text-xs text-sidebar-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</span>
        </div>
      </div>
    </aside>
  );
}