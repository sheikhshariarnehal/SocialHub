"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenTool,
  Calendar,
  Inbox,
  BarChart2,
  Sparkles,
  Share2,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { PlugConnectedIcon, SparklesIcon } from "@/components/icons";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Composer", href: "/compose", icon: PenTool, badge: "New" },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Inbox", href: "/inbox", icon: Inbox },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
];

const SETTINGS_ITEMS = [
  { label: "AI Hub", href: "/settings/ai-providers", icon: SparklesIcon },
  { label: "Accounts", href: "/settings/accounts", icon: PlugConnectedIcon },
  { label: "Settings", href: "/settings/workspace", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 select-none z-30",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header / Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border/60">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/30">
            <Zap className="h-4 w-4 fill-current" />
          </div>
          {!collapsed && (
            <span className="font-bold tracking-tight text-base text-foreground truncate">
              SocialHub
            </span>
          )}
        </Link>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Workspace Switcher */}
      <div className="p-3 border-b border-sidebar-border/40">
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        <div>
          {!collapsed && (
            <p className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Core
            </p>
          )}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-primary/20 text-primary"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          {!collapsed && (
            <p className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Manage & Config
            </p>
          )}
          <nav className="space-y-1">
            {SETTINGS_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 group",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold border border-sidebar-border"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Account / Logout */}
      <div className="p-3 border-t border-sidebar-border/60 space-y-1">
        <form action={logout}>
          <button
            type="submit"
            title={collapsed ? "Log out" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
              collapsed && "justify-center px-2"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
