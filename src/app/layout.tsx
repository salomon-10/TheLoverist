import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import { getUnreadCount } from "@/data/notifications";
import Navigation from "@/components/layout/Navigation";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Loverist",
  description: "Publiez. Discutez. Suivez ce qui compte.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-64.png", sizes: "64x64", type: "image/png" }
    ],
    apple: [{ url: "/app-icon-light.png", sizes: "1024x1024", type: "image/png" }]
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const unreadCount = user ? await getUnreadCount(user.id) : 0;

  return (
    <html
      lang="fr"
      suppressHydrationWarning
      style={
        {
          "--font-display": "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
          "--font-serif": "'Source Serif 4', Georgia, serif",
          "--font-sans": "'Inter', ui-sans-serif, system-ui, sans-serif"
        } as React.CSSProperties
      }
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const stored = localStorage.getItem("the-loverist-theme"); const theme = stored === "dark" || stored === "light" ? stored : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); document.documentElement.classList.toggle("dark", theme === "dark"); document.documentElement.style.colorScheme = theme; } catch {} })();`
          }}
        />
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
          <ThemeProvider>
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
            <main id="main-content" tabIndex={-1} className="w-full pb-6 outline-none lg:pl-64 lg:pb-0">
              {children}
            </main>
            </StackTheme>
          </ThemeProvider>
        </StackProvider>
      </body>
    </html>
  );
}