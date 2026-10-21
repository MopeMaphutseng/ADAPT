import { AchievementForm } from "@/components/admin/AchievementForm";

export const metadata = { title: "New Achievement — Admin" };

export default function NewAchievementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">New achievement</h1>
        <p className="mt-1 text-sm text-slate-400">Document a milestone, launch, award or news item.</p>
      </div>
      <AchievementForm />
    </div>
  );
}