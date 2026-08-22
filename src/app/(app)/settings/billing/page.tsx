"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Check,
  Zap,
  Sparkles,
  CreditCard,
  ArrowRight,
  Shield,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TIERS = [
  {
    id: "free",
    name: "Free Creator",
    price: "$0",
    period: "forever",
    description: "Essential tools for solo creators starting their social presence.",
    features: [
      "2 Connected Social Accounts",
      "30 Scheduled Posts in queue",
      "20 Free AI generations / mo",
      "Basic Cross-Platform Analytics",
      "Single Workspace",
    ],
    isCurrent: true,
  },
  {
    id: "pro",
    name: "Pro Growth",
    price: "$29",
    period: "per month",
    description: "For active creators and fast-growing businesses needing velocity.",
    features: [
      "8 Connected Social Accounts",
      "Unlimited Scheduled Posts",
      "Bring Your Own AI API Keys (Unlimited)",
      "500 Built-in AI Generations",
      "Unified Inbox with Quick Reply",
      "Exportable PDF/CSV Reports",
      "Auto-Reply Agent Rules",
    ],
    isPopular: true,
    isCurrent: false,
  },
  {
    id: "agency",
    name: "Team & Agency",
    price: "$99",
    period: "per month",
    description: "For agencies and marketing teams managing multiple brands.",
    features: [
      "Unlimited Connected Accounts",
      "Unlimited Workspaces & Multi-tenant",
      "10 Team Member Seats",
      "Role-Based Access Controls",
      "Dedicated Worker Job Queues",
      "Priority 24/7 SLA Support",
    ],
    isCurrent: false,
  },
];

export default function BillingSettingsPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const handleUpgrade = (tierName: string) => {
    toast.success(`Redirecting to Stripe Checkout for ${tierName}...`);
  };

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in-50">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Subscription & Usage Limits
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your active resource consumption and upgrade for increased capacity.
        </p>
      </div>

      {/* Current Usage Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card glass className="p-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>AI Generations</span>
            <span className="font-semibold text-foreground">12 / 20</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: "60%" }} />
          </div>
          <p className="text-[10px] text-muted-foreground">Resets in 9 days</p>
        </Card>

        <Card glass className="p-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Connected Accounts</span>
            <span className="font-semibold text-foreground">3 / 2</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-warning rounded-full" style={{ width: "100%" }} />
          </div>
          <p className="text-[10px] text-warning">1 account over free limit</p>
        </Card>

        <Card glass className="p-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Scheduled Queue</span>
            <span className="font-semibold text-foreground">14 / 30</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-success rounded-full" style={{ width: "46%" }} />
          </div>
          <p className="text-[10px] text-muted-foreground">16 slots remaining</p>
        </Card>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map((tier) => (
          <Card
            key={tier.id}
            glass
            className={`flex flex-col justify-between relative transition-all duration-300 ${
              tier.isPopular
                ? "border-primary/80 shadow-xl shadow-primary/5"
                : "border-border/80"
            }`}
          >
            {tier.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="brand" className="text-[10px] uppercase font-bold tracking-wider px-3">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-lg font-bold">{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
              <div className="pt-3">
                <span className="text-3xl font-extrabold text-foreground">{tier.price}</span>
                <span className="text-xs text-muted-foreground ml-1">/{tier.period}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-2.5">
              {tier.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </CardContent>

            <CardFooter className="pt-4 border-t border-border/40">
              {tier.isCurrent ? (
                <Button variant="outline" className="w-full text-xs" disabled>
                  Current Active Plan
                </Button>
              ) : (
                <Button
                  variant={tier.isPopular ? "brand" : "default"}
                  className="w-full text-xs"
                  onClick={() => handleUpgrade(tier.name)}
                >
                  Upgrade to {tier.name.split(" ")[0]}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
