import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import { getUnreadCount } from "@/data/notifications";
import Navigation from "@/components/layout/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Threadline",
  description: "Publiez. Discutez. Suivez ce qui compte."
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const unreadCount = user ? await getUnreadCount(user.id) : 0;

  return (
    <html
      lang="fr"
      style={
        {
          "--font-display": "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
          "--font-serif": "'Source Serif 4', Georgia, serif",
          "--font-sans": "'Inter', ui-sans-serif, system-ui, sans-serif"
        } as React.CSSProperties
      }
    >
      <head>
        {/* Polices chargées par le navigateur (pas par le serveur Node) :
            évite toute dépendance réseau du serveur vers Google Fonts,
            utile en dev derrière un proxy/pare-feu qui bloque ce domaine. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <StackProvider app={stackServerApp}>
          <StackTheme
            theme={{
              light: {
                background: "#FFFFFF",
                foreground: "#18181F",
                card: "#FFFFFF",
                cardForeground: "#18181F",
                popover: "#FFFFFF",
                popoverForeground: "#18181F",
                primary: "#3730A9",
                primaryForeground: "#FFFFFF",
                secondary: "#F6F6F8",
                secondaryForeground: "#18181F",
                muted: "#F6F6F8",
                mutedForeground: "#6B6A75",
                accent: "#EEEDFB",
                accentForeground: "#3730A9",
                destructive: "#DC2626",
                destructiveForeground: "#FFFFFF",
                border: "#E5E4EA",
                input: "#E5E4EA",
                ring: "#3730A9"
              },
              radius: "10px"
            }}
          >
            <Navigation viewer={user} unreadCount={unreadCount} />
            <main id="main-content" tabIndex={-1} className="w-full pb-24 outline-none lg:pb-0">
              {children}
            </main>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}