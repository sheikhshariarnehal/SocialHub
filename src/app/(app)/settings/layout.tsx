"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  User,
  Share2,
  Sparkles,
  CreditCard,
  Bell,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SETTINGS_NAV = [
  { label: "Workspace", href: "/settings/workspace", icon: Building2 },
  { label: "Accounts", href: "/settings/accounts", icon: Share2 },
  { label: "AI Providers", href: "/settings/ai-providers", icon: Sparkles },
  { label: "Billing & Plans", href: "/settings/billing", icon: CreditCard },
  { label: "Profile", href: "/settings/profile", icon: User },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border/80 pb-3">
        {SETTINGS_NAV.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-all",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      <div>{children}</div>
    </div>
  );
}
