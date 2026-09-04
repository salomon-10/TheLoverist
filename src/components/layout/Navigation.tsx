"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bell, Bookmark, PenSquare, FileEdit, BarChart2 } from "lucide-react";
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

  return (
    <>
      {/* Barre supérieure — pleine largeur, desktop et mobile */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-md">
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
                className="focus-ring transition-platform rounded-md border border-line-strong px-4 py-2.5 font-sans text-body-sm font-semibold text-ink hover:border-ink/30 hover:bg-surface"
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Barre inférieure — mobile uniquement */}
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-line bg-paper/95 py-2 backdrop-blur-md lg:hidden"
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
        {isAuthor && <TabLink href="/create" icon={PenSquare} label="Publier" active={pathname === "/create"} />}
        {isAuthor && <TabLink href="/drafts" icon={FileEdit} label="Brouillons" active={pathname === "/drafts"} />}
        {isAuthor && <TabLink href="/dashboard" icon={BarChart2} label="Stats" active={pathname === "/dashboard"} />}
        {viewer && !isAuthor && (
          <TabLink href="/bookmarks" icon={Bookmark} label="Sauvegardes" active={pathname === "/bookmarks"} />
        )}

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
      className="focus-ring relative flex flex-col items-center gap-1 rounded-lg px-3 py-1"
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
        "focus-ring flex flex-col items-center gap-1 rounded-lg px-3 py-1",
        active && "rounded-full ring-2 ring-accent ring-offset-2 ring-offset-paper"
      )}
    >
      <UserAvatar src={avatarSrc} name={avatarName} size="sm" />
      <span className="sr-only">Profil</span>
    </Link>
  );
}
