import Link from "next/link";
import {
  FolderKanban,
  Trophy,
  MessagesSquare,
  Users,
  Megaphone,
  ImagePlus,
  Activity,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSessionUser();
  const me = session
    ? await prisma.user.findUnique({
        where: { id: session.sub },
        include: { role: true },
      })
    : null;

  const [
    projects,
    achievements,
    announcements,
    messages,
    unreadMessages,
    investors,
    newInvestors,
    media,
    users,
    recentActivity,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.achievement.count(),
    prisma.announcement.count(),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.investorInquiry.count(),
    prisma.investorInquiry.count({ where: { status: "NEW" } }),
    prisma.media.count(),
    prisma.user.count(),
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const cards = [
    { label: "Projects", value: projects, href: "/admin/projects", icon: FolderKanban },
    { label: "Achievements", value: achievements, href: "/admin/achievements", icon: Trophy },
    { label: "Messages", value: messages, href: "/admin/messages", icon: MessagesSquare },
    { label: "Unread Messages", value: unreadMessages, href: "/admin/messages?status=NEW", icon: MessagesSquare, highlight: unreadMessages > 0 },
    { label: "Investor Leads", value: investors, href: "/admin/investors", icon: Users },
    { label: "New Investor Leads", value: newInvestors, href: "/admin/investors?status=NEW", icon: Users, highlight: newInvestors > 0 },
    { label: "Announcements", value: announcements, href: "/admin/announcements", icon: Megaphone },
    { label: "Media Files", value: media, href: "/admin/media", icon: ImagePlus },
  ];

  const timeAgo = (d: Date) => {
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Overview of your ADAPT Technologies platform{me ? ` — signed in as ${me.name}` : ""}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`card !p-5 transition-colors hover:border-accent-500/50 ${
              c.highlight ? "border-accent-500/50" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <c.icon className={`h-5 w-5 ${c.highlight ? "text-accent-300" : "text-accent-400"}`} aria-hidden="true" />
              {c.highlight ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1.5 text-xs font-bold text-white">new</span>
              ) : null}
            </div>
            <p className="mt-4 text-3xl font-bold text-white">{c.value}</p>
            <p className="mt-1 text-sm text-slate-400">{c.label}</p>
          </Link>
        ))}
      </div>

      {users === 1 ? (
        <div className="card flex flex-col gap-3 border-amber-500/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-white">Security checkpoint</p>
              <p className="mt-1 text-sm text-slate-400">
                {`You currently have ${users} admin account. Add team members with limited roles (Content / Communications) from the Users page.`}
              </p>
            </div>
          </div>
          <Link href="/admin/users" className="btn-secondary shrink-0 !px-4 !py-2 text-xs">
            Manage users
          </Link>
        </div>
      ) : null}

      {unreadMessages > 0 || newInvestors > 0 ? (
        <div className="card border-accent-500/40">
          <h2 className="text-sm font-semibold text-white">Notifications</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {newInvestors > 0 ? (
              <li>
                <Link href="/admin/investors?status=NEW" className="text-accent-300 hover:underline">
                  🔵 New Investor Inquiry
                </Link>
              </li>
            ) : null}
            {unreadMessages > 0 ? (
              <li>
                <Link href="/admin/messages?status=NEW" className="text-accent-300 hover:underline">
                  🔵 New Contact Message
                </Link>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Activity className="h-4 w-4 text-accent-400" aria-hidden="true" />
            Recent Activity
          </h2>
        </div>
        {recentActivity.length > 0 ? (
          <ul className="mt-4 divide-y divide-slate-800">
            {recentActivity.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate text-slate-200">
                    <span className="font-medium">{a.user?.name ?? "System"}</span>
                    <span className="text-slate-500"> · </span>
                    <span className="font-mono text-xs text-accent-300">{a.action}</span>
                    {a.entity ? (
                      <span className="text-slate-500"> on {a.entity}</span>
                    ) : null}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-slate-500">{timeAgo(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No activity recorded yet.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/projects/new" className="btn-primary">+ New project</Link>
        <Link href="/admin/achievements/new" className="btn-secondary">+ New achievement</Link>
        <Link href="/admin/announcements" className="btn-ghost">
          Manage announcements <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}