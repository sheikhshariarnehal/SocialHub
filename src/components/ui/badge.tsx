import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/15 text-destructive border-destructive/20",
        outline: "text-foreground border-border",
        success:
          "border-success/20 bg-success/15 text-success font-medium",
        warning:
          "border-warning/20 bg-warning/15 text-warning font-medium",
        info: "border-info/20 bg-info/15 text-info font-medium",
        brand:
          "border-transparent bg-gradient-to-r from-[oklch(0.68_0.20_268)] to-[oklch(0.60_0.24_290)] text-white shadow-xs",
        instagram:
          "border-transparent bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white",
        twitter: "border-border bg-neutral-900 text-neutral-100",
        linkedin: "border-transparent bg-[#0A66C2] text-white",
        facebook: "border-transparent bg-[#1877F2] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotColor?: string;
}

function Badge({ className, variant, dot, dotColor, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            dotColor || "bg-current"
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
