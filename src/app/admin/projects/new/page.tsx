import { ProjectForm } from "@/components/admin/ProjectForm";

export const metadata = { title: "New Project — Admin" };

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">New project</h1>
        <p className="mt-1 text-sm text-slate-400">Add a product or project to the public portfolio.</p>
      </div>
      <ProjectForm />
    </div>
  );
}