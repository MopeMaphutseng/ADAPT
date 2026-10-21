import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const metadata = { title: "Edit Project — Admin" };
export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Edit project</h1>
        <p className="mt-1 text-sm text-slate-400">{project.title}</p>
      </div>
      <ProjectForm initial={project} />
    </div>
  );
}