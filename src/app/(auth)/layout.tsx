import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center p-4 sm:p-8 bg-background overflow-hidden">
      {/* Dynamic Background Glows */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] -z-10 blur-3xl opacity-30 pointer-events-none rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.68 0.20 268) 0%, oklch(0.40 0.15 280) 50%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-10 right-10 w-[300px] h-[300px] -z-10 blur-3xl opacity-20 pointer-events-none rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.25 25) 0%, transparent 70%)",
        }}
      />

      {/* Top Brand Link */}
      <Link
        href="/"
        className="mb-8 flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <Zap className="h-5 w-5 fill-current" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-foreground">
          SocialHub
        </span>
      </Link>

      {/* Card Wrapper */}
      <div className="w-full max-w-md">{children}</div>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} SocialHub Inc. All rights reserved.
      </div>
    </div>
  );
}
