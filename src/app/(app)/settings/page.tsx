import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeCourse } from "@/lib/serialize";
import { ProfileForm } from "@/components/profile-form";
import { ThemeSettings } from "@/components/theme-settings";
import { CourseManager } from "@/components/course-manager";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const courses = await prisma.course.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-8 sm:px-6">
      <h1 className="font-serif text-2xl font-semibold text-navy-900">Settings</h1>
      <ProfileForm name={session.user.name ?? ""} />
      <ThemeSettings />
      <CourseManager initialCourses={courses.map(serializeCourse)} />
    </main>
  );
}
