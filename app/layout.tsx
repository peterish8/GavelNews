import type { Metadata } from "next";
import "./globals.css";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Gavel News — CLAT Current Affairs",
  description:
    "Daily CLAT current-affairs, written for UG and PG aspirants. Today's edition, archive, search.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Gavel News",
    description: "Daily CLAT current-affairs for UG and PG aspirants.",
    type: "website",
  },
};

// Theme bootstrap — runs before paint so we don't flash the wrong palette.
// Reads localStorage / prefers-color-scheme and sets html.classList.
const themeBootstrap = `
(function () {
  try {
    var stored = localStorage.getItem('gavel-theme');
    var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var theme = stored === 'dark' || stored === 'light' ? stored : system;
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-screen bg-surface text-ink antialiased">
        <TopNav />
        <main className="min-h-[calc(100vh-160px)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}