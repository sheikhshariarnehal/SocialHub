import Link from "next/link";
import {
  Zap,
  Shield,
  Sparkles,
  Calendar,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Globe,
} from "lucide-react";

const FEATURES = [
  {
    icon: Globe,
    title: "Multi-Platform Hub",
    description:
      "Connect Instagram, X, LinkedIn, TikTok, YouTube, and more. One dashboard for every platform.",
  },
  {
    icon: Sparkles,
    title: "AI Content Engine",
    description:
      "Generate captions, hashtags, and replies with your own AI keys. OpenAI, Gemini, or any provider.",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "Visual calendar, drag-and-drop scheduling, and per-platform previews before you publish.",
  },
  {
    icon: MessageSquare,
    title: "Unified Inbox",
    description:
      "Comments, DMs, and mentions from every platform in one stream. Reply without switching tabs.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Cross-platform engagement metrics, growth trends, and exportable reports.",
  },
  {
    icon: Shield,
    title: "Workspace Isolation",
    description:
      "Row-level security, role-based access, and multi-workspace support from day one.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.40 0.18 268 / 0.3), transparent)",
          }}
        />

        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">SocialHub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-md"
            >
              Get started free
            </Link>
          </div>
        </nav>

        <div className="mx-auto max-w-4xl px-6 pb-24 pt-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Provider-agnostic AI — use your own keys
          </div>

          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            One dashboard.
            <br />
            <span className="text-gradient">Every platform.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Connect all your social accounts, compose & schedule posts with AI,
            and monitor engagement — without switching between ten different
            tabs.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:brightness-110"
            >
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 px-8 py-3.5 text-base font-semibold backdrop-blur transition-colors hover:bg-accent"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight">
            Everything you need to manage your social presence
          </h2>
          <p className="text-muted-foreground">
            Built for solo creators and small teams who want power without
            complexity.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span>SocialHub</span>
          </div>
          <p>Built for creators, by creators.</p>
        </div>
      </footer>
    </div>
  );
}
