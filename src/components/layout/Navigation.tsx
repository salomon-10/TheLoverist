"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Bell, Bookmark, PenSquare, FileEdit, BarChart2, MoreHorizontal, X } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
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
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  useEffect(() => {
    if (!isMoreOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMoreOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isMoreOpen]);

  return (
    <>
      {/* Barre supérieure — pleine largeur, desktop et mobile */}
      <header className="sticky top-0 z-40 bg-paper/95 shadow-header backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-canvas items-center justify-between px-margin-mobile md:h-[72px] md:px-margin-desktop">
          <Link
            href="/"
            className="focus-ring flex items-center gap-2 rounded font-display text-headline-sm font-bold tracking-tight text-ink transition-platform hover:opacity-80 md:text-headline"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-white">
              <PenSquare size={16} strokeWidth={2.25} />
            </span>
            The Loverist
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
            <NavPill href="/" label="Accueil" active={pathname === "/"} />
            {viewer && <NavPill href="/bookmarks" label="Sauvegardes" active={pathname === "/bookmarks"} />}
            {isAuthor && <NavPill href="/dashboard" label="Statistiques" active={pathname === "/dashboard"} />}
          </nav>

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

            {viewer?.profile ? (
              <Link href={`/profile/${viewer.profile.username}`} className="focus-ring rounded-full">
                <UserAvatar src={viewer.profile.avatarUrl} name={viewer.profile.displayName} size="sm" />
              </Link>
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

      {isMoreOpen && (viewer || isAuthor) && (
        <>
          <button
            type="button"
            aria-label="Fermer le menu"
            className="fixed inset-0 z-40 bg-ink/20 lg:hidden"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="fixed inset-x-4 bottom-[76px] z-50 rounded-lg bg-paper p-2 shadow-float lg:hidden">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="font-display text-headline-sm font-semibold text-ink">Plus</span>
              <button
                type="button"
                aria-label="Fermer le menu"
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-ink"
                onClick={() => setIsMoreOpen(false)}
              >
                <X size={19} />
              </button>
            </div>
            <div className="grid gap-1 sm:grid-cols-2">
              {viewer && <DrawerLink href="/bookmarks" icon={Bookmark} label="Sauvegardes" active={pathname === "/bookmarks"} onNavigate={() => setIsMoreOpen(false)} />}
              {isAuthor && <DrawerLink href="/drafts" icon={FileEdit} label="Brouillons" active={pathname === "/drafts"} onNavigate={() => setIsMoreOpen(false)} />}
              {isAuthor && <DrawerLink href="/dashboard" icon={BarChart2} label="Statistiques" active={pathname === "/dashboard"} onNavigate={() => setIsMoreOpen(false)} />}
            </div>
          </div>
        </>
      )}

      {/* Barre inférieure — mobile uniquement */}
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-40 flex min-h-[68px] items-stretch justify-around bg-paper/95 px-1 pb-[env(safe-area-inset-bottom)] pt-1 shadow-[0_-4px_20px_rgb(24_24_31_/_0.06)] backdrop-blur-md lg:hidden"
      >
        <TabLink href="/" icon={Home} label="Accueil" active={pathname === "/"} />
        {viewer ? (
          <TabLink
            href="/notifications"
            icon={Bell}
            label="Notifs"
            badge={unreadCount > 0}
            active={pathname === "/notifications"}
          />
        ) : (
          <TabLink href="/login" icon={Bell} label="Connexion" active={pathname === "/login"} />
        )}
        {isAuthor ? (
          <TabLink href="/create" icon={PenSquare} label="Publier" active={pathname === "/create"} />
        ) : viewer ? (
          <TabLink href="/bookmarks" icon={Bookmark} label="Sauvegardes" active={pathname === "/bookmarks"} />
        ) : null}

        {viewer?.profile ? (
          <ProfileTabLink
            href={`/profile/${viewer.profile.username}`}
            avatarSrc={viewer.profile.avatarUrl}
            avatarName={viewer.profile.displayName}
            active={pathname === `/profile/${viewer.profile.username}`}
          />
        ) : (
          <TabLink href="/login" icon={Home} label="Profil" active={false} />
        )}
        {(viewer || isAuthor) && (
          <button
            type="button"
            aria-expanded={isMoreOpen}
            aria-label="Ouvrir plus d'options"
            className={cx("focus-ring flex min-w-[56px] flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2", isMoreOpen && "bg-surface")}
            onClick={() => setIsMoreOpen((open) => !open)}
          >
            <MoreHorizontal size={21} strokeWidth={isMoreOpen ? 2.1 : 1.75} className={isMoreOpen ? "text-accent" : "text-muted"} />
            <span className={cx("font-sans text-[10px] font-medium", isMoreOpen ? "text-accent" : "text-muted")}>Plus</span>
          </button>
        )}
      </nav>
    </>
  );
}

function NavPill({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx(
        "focus-ring transition-platform rounded-md px-3.5 py-2 font-sans text-body-sm font-semibold",
        active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface hover:text-ink"
      )}
    >
      {label}
    </Link>
  );
}

function TabLink({
  href,
  icon: Icon,
  label,
  badge,
  active
}: {
  href: string;
  icon: typeof Home;
  label: string;
  badge?: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="focus-ring relative flex min-w-[56px] flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2"
    >
      <Icon size={21} strokeWidth={active ? 2.1 : 1.75} className={active ? "text-accent" : "text-muted"} />
      {badge && <span className="absolute right-2 top-0.5 h-1.5 w-1.5 rounded-full bg-signal" />}
      <span className={cx("font-sans text-[10px] font-medium", active ? "text-accent" : "text-muted")}>
        {label}
      </span>
    </Link>
  );
}

function ProfileTabLink({
  href,
  avatarSrc,
  avatarName,
  active
}: {
  href: string;
  avatarSrc: string | null;
  avatarName: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx(
        "focus-ring flex min-w-[56px] flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2",
        active && "bg-surface"
      )}
    >
      <UserAvatar src={avatarSrc} name={avatarName} size="sm" />
      <span className="sr-only">Profil</span>
    </Link>
  );
}

function DrawerLink({
  href,
  icon: Icon,
  label,
  active,
  onNavigate
}: {
  href: string;
  icon: typeof Bookmark;
  label: string;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cx(
        "focus-ring flex min-h-12 items-center gap-3 rounded-md px-3 font-sans text-body-md font-medium transition-colors",
        active ? "bg-accent-soft text-accent" : "text-ink hover:bg-surface"
      )}
    >
      <Icon size={19} strokeWidth={1.8} />
      {label}
    </Link>
  );
}
