import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeTask } from "@/lib/serialize";
import { NavBar } from "@/components/nav-bar";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    include: { course: true, subtasks: true },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar userName={session.user.name ?? session.user.email ?? "Account"} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <AnalyticsDashboard tasks={tasks.map(serializeTask)} />
      </main>
    </div>
  );
}
