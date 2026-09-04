"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Bell, PenSquare, FileEdit, BarChart2, Menu, X, Sun, Moon, ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { SessionUser } from "@/types";
import { cx } from "@/lib/utils";

export default function Navigation({
  viewer,
  unreadCount
}: {
  viewer: SessionUser | null;
  unreadCount: number;
}) {
  const isAuthor = Boolean(viewer?.profile?.isAuthor);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isSidebarOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSidebarOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isSidebarOpen]);

  return (
    <>
      {/* Barre supérieure — pleine largeur, desktop et mobile */}
      <header className="sticky top-0 z-50 bg-paper/95 shadow-header backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-canvas items-center justify-between px-margin-mobile md:h-[72px] md:px-margin-desktop">
          <Link
            href="/"
            className="focus-ring flex items-center gap-2 rounded font-display text-headline-sm font-bold tracking-tight text-ink transition-platform hover:opacity-80 md:text-headline"
          >
            <picture className="shrink-0">
              <img src="/app-icon-light.png" alt="" className="h-8 w-8 rounded-md dark:hidden" />
              <img src="/app-icon-dark.png" alt="" className="hidden h-8 w-8 rounded-md dark:block" />
            </picture>
            The Loverist
          </Link>

          <div className="flex items-center gap-2.5">
            {viewer && (
              <Link
                href="/notifications"
                aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} non lues` : "Notifications"}
                className={cx(
                  "focus-ring transition-platform relative flex h-10 w-10 items-center justify-center rounded-full",
                  pathname === "/notifications" ? "bg-surface-sunken text-ink" : "text-ink hover:bg-surface-sunken"
                )}
              >
                <Bell size={19} strokeWidth={1.75} />
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-signal ring-2 ring-paper" />
                )}
              </Link>
            )}

            {isAuthor && (
              <Link
                href="/create"
                className="focus-ring transition-platform hidden items-center rounded-md bg-accent px-4 py-2.5 font-sans text-body-sm font-semibold text-white shadow-card hover:bg-accent-hover hover:shadow-card-hover sm:inline-flex"
              >
                Publier
              </Link>
            )}

            {viewer ? (
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            ) : (
              <Link
                href="/login"
                className="focus-ring transition-platform rounded-md bg-surface px-4 py-2.5 font-sans text-body-sm font-semibold text-ink hover:bg-surface-sunken"
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 top-[72px] z-30 hidden w-64 bg-surface px-4 py-6 lg:block">
        <SidebarLinks pathname={pathname} viewer={viewer} isAuthor={isAuthor} />
      </aside>

      {isSidebarOpen && (
        <>
          <button
            type="button"
            aria-label="Fermer le menu"
            className="fixed inset-0 z-50 bg-ink/25 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-[60] w-[min(86vw,20rem)] bg-paper px-4 py-5 shadow-float lg:hidden">
            <div className="mb-5 flex items-center justify-between">
              <span className="font-display text-headline-sm font-semibold text-ink">Menu</span>
              <button
                type="button"
                aria-label="Fermer le menu"
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-ink"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X size={19} />
              </button>
            </div>
            <SidebarLinks pathname={pathname} viewer={viewer} isAuthor={isAuthor} onNavigate={() => setIsSidebarOpen(false)} />
          </div>
        </>
      )}

      <nav
        aria-label="Navigation mobile"
        className="fixed inset-x-0 bottom-0 z-40 flex min-h-[68px] items-stretch justify-around bg-paper/95 px-1 pb-[env(safe-area-inset-bottom)] pt-1 shadow-[0_-4px_20px_rgb(24_24_31_/_0.06)] backdrop-blur-md lg:hidden"
      >
        <MobileNavLink href="/" icon={Home} label="Accueil" active={pathname === "/"} />
        {viewer && (
          <MobileNavLink
            href="/notifications"
            icon={Bell}
            label="Notifications"
            active={pathname === "/notifications"}
            badge={unreadCount}
          />
        )}
        {isAuthor && (
          <MobileNavButton
            icon={PenSquare}
            label="Répertoires"
            active={pathname === "/create" || pathname === "/drafts"}
            onClick={() => setIsSidebarOpen(true)}
          />
        )}
        {viewer?.profile && (
          <MobileNavLink
            href={`/profile/${viewer.profile.username}`}
            icon={Home}
            label="Profil"
            active={pathname === `/profile/${viewer.profile.username}`}
          />
        )}
       
      </nav>
    </>
  );
}

function MobileNavLink({
  href,
  icon: Icon,
  label,
  active,
  badge
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx(
        "focus-ring relative flex min-w-[64px] flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 font-sans text-[10px] font-medium",
        active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-sunken hover:text-ink"
      )}
    >
      <Icon size={21} strokeWidth={active ? 2.1 : 1.8} />
      {badge ? <span className="absolute right-3 top-1.5 h-2 w-2 rounded-full bg-signal ring-2 ring-paper" /> : null}
      <span>{label}</span>
    </Link>
  );
}

function MobileNavButton({
  icon: Icon,
  label,
  active,
  onClick
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={active}
      onClick={onClick}
      className={cx(
        "focus-ring relative flex min-w-[64px] flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 font-sans text-[10px] font-medium",
        active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-sunken hover:text-ink"
      )}
    >
      <Icon size={21} strokeWidth={active ? 2.1 : 1.8} />
      <span>{label}</span>
    </button>
  );
}

function ThemeToggle({ theme, onToggle }: { theme: "light" | "dark"; onToggle: () => void }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      title={isDark ? "Mode clair" : "Mode sombre"}
      className="focus-ring transition-platform flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-surface-sunken"
    >
      {isDark ? <Sun size={19} strokeWidth={1.8} /> : <Moon size={19} strokeWidth={1.8} />}
    </button>
  );
}

function SidebarLinks({
  pathname,
  viewer,
  isAuthor,
  onNavigate
}: {
  pathname: string;
  viewer: SessionUser | null;
  isAuthor: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-2" aria-label="Navigation principale">
      <SidebarLink href="/" icon={Home} label="Accueil" active={pathname === "/"} onNavigate={onNavigate} />
      {isAuthor && (
        <div className="pt-2">
          <SidebarLink
            href="/create"
            icon={PenSquare}
            label="Répertoires"
            active={pathname === "/create" || pathname === "/drafts"}
            onNavigate={onNavigate}
            trailing={<ChevronDown size={16} />}
          />
          <div className="ml-8 mt-1 flex flex-col gap-1 border-l border-line pl-3">
            <SidebarSubLink href="/create" label="New Post" active={pathname === "/create"} onNavigate={onNavigate} />
            <SidebarSubLink href="/drafts" label="Brouillons" active={pathname === "/drafts"} onNavigate={onNavigate} />
          </div>
        </div>
      )}
      {isAuthor && <SidebarLink href="/dashboard" icon={BarChart2} label="Stats" active={pathname === "/dashboard"} onNavigate={onNavigate} />}
      {viewer?.profile && (
        <SidebarLink
          href={`/profile/${viewer.profile.username}`}
          icon={Home}
          label="Profil"
          active={pathname === `/profile/${viewer.profile.username}`}
          onNavigate={onNavigate}
          avatar={{ src: viewer.profile.avatarUrl, name: viewer.profile.displayName }}
        />
      )}
    </nav>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  active,
  onNavigate,
  trailing,
  avatar
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  onNavigate?: () => void;
  trailing?: React.ReactNode;
  avatar?: { src: string | null; name: string };
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cx(
        "focus-ring flex min-h-12 items-center gap-3 rounded-md px-3 font-sans text-body-md font-medium transition-colors",
        active ? "bg-accent-soft text-accent" : "text-ink hover:bg-surface-sunken"
      )}
    >
      {avatar ? <UserAvatar src={avatar.src} name={avatar.name} size="sm" /> : <Icon size={19} strokeWidth={1.8} />}
      <span className="flex-1">{label}</span>
      {trailing}
    </Link>
  );
}

function SidebarSubLink({ href, label, active, onNavigate }: { href: string; label: string; active: boolean; onNavigate?: () => void }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cx(
        "focus-ring flex min-h-10 items-center rounded-md px-3 font-sans text-body-sm transition-colors",
        active ? "font-semibold text-accent" : "text-muted hover:bg-surface-sunken hover:text-ink"
      )}
    >
      {label}
    </Link>
  );
}
