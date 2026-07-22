import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { getDataSource } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = getDataSource();
  const [today, archive, user] = await Promise.all([
    data.getTodayEdition(),
    data.getArchive(),
    getCurrentUser(),
  ]);
  const editionIndex = archive.reduce((n, m) => n + m.editions.length, 0);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body
        className="h-dvh overflow-hidden text-ink antialiased"
        suppressHydrationWarning
      >
        <div className="ambient-sunrise" aria-hidden />
        <div className="relative z-[1] h-dvh overflow-hidden">
          <AppShell
            signedIn={user.signedIn}
            email={user.email}
            editionDate={today.date}
            storyCount={today.stories.length}
            editionIndex={editionIndex}
          >
            {children}
          </AppShell>
        </div>
      </body>
    </html>
  );
}
