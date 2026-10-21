"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Trophy,
  Megaphone,
  Users,
  MessagesSquare,
  ImagePlus,
  PenSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Inbox,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/lib/client";
import { ROLE_LABELS } from "@/lib/constants";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: string;
  badgeKey?: "messages" | "investors" | "security" | "communications";
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban, permission: "content.manage" },
  { href: "/admin/achievements", label: "Achievements", icon: Trophy, permission: "content.manage" },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone, permission: "content.manage" },
  { href: "/admin/investors", label: "Investors", icon: Users, permission: "comms.manage", badgeKey: "investors" },
  { href: "/admin/messages", label: "Messages", icon: MessagesSquare, permission: "comms.manage", badgeKey: "messages" },
  { href: "/admin/communications", label: "Communications", icon: Inbox, permission: "comms.manage", badgeKey: "communications" },
  { href: "/admin/media", label: "Media", icon: ImagePlus, permission: "media.manage" },
  { href: "/admin/content", label: "Site Content", icon: PenSquare, permission: "content.manage" },
  { href: "/admin/users", label: "Users", icon: Users, permission: "users.manage" },
  { href: "/admin/security", label: "Security", icon: ShieldCheck, permission: "security.manage", badgeKey: "security" },
  { href: "/admin/settings", label: "Settings", icon: Settings, permission: "_all" },
];

function hasPermission(role: string, perm: string): boolean {
  if (perm === "_all") return true;
  if (role === "SUPER_ADMIN") return true;
  if (perm === "dashboard.view") return ["CONTENT_ADMIN", "COMMS_ADMIN"].includes(role);
  if (perm === "content.manage" || perm === "media.manage") return role === "CONTENT_ADMIN";
  if (perm === "comms.manage") return role === "COMMS_ADMIN";
  if (perm === "users.manage" || perm === "security.manage") return false;
  return false;
}

export function AdminShell({
  user,
  unread,
  children,
}: {
  user: { name: string; email: string; role: string };
  unread: { messages: number; investors: number; security: number; communications: number };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => setDrawer(false), [pathname]);

  const items = NAV.filter((n) => hasPermission(user.role, n.permission));
  const badgeCount = (key?: NavItem["badgeKey"]) => (key ? unread[key] : 0);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await api("/api/auth/logout");
      router.push("/admin/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  const nav = (
    <nav aria-label="Admin navigation" className="flex flex-1 flex-col gap-1 px-3 py-4">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const badge = badgeCount(item.badgeKey);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-accent-500/15 text-white ring-1 ring-accent-500/40"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {item.label}
            {badge > 0 ? (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1.5 text-xs font-bold text-white">
                {badge}
              </span>
            ) : null}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
      >
        <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
        {loggingOut ? "Signing out…" : "Logout"}
      </button>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-ink-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-ink-900/50 lg:flex lg:flex-col">
        <div className="border-b border-slate-800 px-5 py-5">
          <Link href="/admin" className="block">
            <p className="text-lg font-bold tracking-[0.12em] text-white">ADAPT<span className="text-accent-400">//</span>ADMIN</p>
            <p className="mt-0.5 text-xs text-slate-500">Management Platform</p>
          </Link>
        </div>
        {nav}
      </aside>

      {/* Mobile topbar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-ink-950/95 px-4 py-3 backdrop-blur lg:hidden">
        <p className="text-base font-bold tracking-[0.12em] text-white">
          ADAPT<span className="text-accent-400">//</span>ADMIN
        </p>
        <button
          type="button"
          aria-expanded={drawer}
          aria-controls="admin-drawer"
          onClick={() => setDrawer((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 text-white"
        >
          {drawer ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>
      {drawer ? (
        <div id="admin-drawer" className="border-b border-slate-800 bg-ink-900 lg:hidden">
          {nav}
        </div>
      ) : null}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden items-center justify-between border-b border-slate-800 bg-ink-900/40 px-8 py-4 lg:flex">
          <p className="text-sm text-slate-500">
            Welcome back, <span className="font-medium text-white">{user.name}</span>
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="chip !border-accent-500/40 !text-accent-300">
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
            <span className="text-slate-500">{user.email}</span>
          </div>
        </header>
        <main className="flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}