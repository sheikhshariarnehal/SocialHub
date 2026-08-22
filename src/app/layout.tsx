import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SocialHub — Unified Social Media Management",
    template: "%s | SocialHub",
  },
  description:
    "Connect all your social accounts, compose and schedule posts, generate AI captions, and monitor engagement from one powerful dashboard.",
  keywords: [
    "social media management",
    "scheduling",
    "AI content",
    "dashboard",
    "multi-platform",
  ],
  authors: [{ name: "SocialHub" }],
  openGraph: {
    title: "SocialHub — Unified Social Media Management",
    description:
      "One dashboard. Every platform. AI-powered content. Provider-agnostic.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            className:
              "bg-card text-card-foreground border-border shadow-lg",
          }}
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
