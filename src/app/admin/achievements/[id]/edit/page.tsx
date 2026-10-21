import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AchievementForm } from "@/components/admin/AchievementForm";

export const metadata = { title: "Edit Achievement — Admin" };
export const dynamic = "force-dynamic";

export default async function EditAchievementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const achievement = await prisma.achievement.findUnique({ where: { id } });
  if (!achievement) notFound();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Edit achievement</h1>
        <p className="mt-1 text-sm text-slate-400">{achievement.title}</p>
      </div>
      <AchievementForm initial={achievement} />
    </div>
  );
}