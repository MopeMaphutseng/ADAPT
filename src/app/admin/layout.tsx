import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();

  // No session → render the page unwrapped (login page). Middleware guards
  // every other /admin route and APIs enforce auth server-side regardless.
  if (!session) {
    return <>{children}</>;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { role: true },
  });
  if (!user || !user.active) {
    return <>{children}</>;
  }

  const [unreadMessages, unreadInvestors, unreadSecurity, unreadCommunications] = await Promise.all([
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.investorInquiry.count({ where: { status: "NEW" } }),
    prisma.securityAlert.count({ where: { status: "OPEN" } }).catch(() => 0),
    prisma.conversation.count({ where: { unreadForAdmin: true } }).catch(() => 0),
  ]);

  return (
    <AdminShell
      user={{ name: user.name, email: user.email, role: user.role.name }}
      unread={{
        messages: unreadMessages,
        investors: unreadInvestors,
        security: unreadSecurity,
        communications: unreadCommunications,
      }}
    >
      {children}
    </AdminShell>
  );
}