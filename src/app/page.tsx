import { redirect } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  LayoutGrid,
  CalendarDays,
  Repeat,
  BarChart3,
  Command,
  Tag,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Tag,
    title: "Organize by course",
    description: "Color-coded courses, tags, and subtasks keep every assignment in context.",
  },
  {
    icon: LayoutGrid,
    title: "List, board, or calendar",
    description: "Switch between a task list, a drag-and-drop board, or a month calendar view.",
  },
  {
    icon: CalendarDays,
    title: "Smart lists",
    description: "Today, Upcoming, and Overdue views surface what actually needs attention.",
  },
  {
    icon: Repeat,
    title: "Recurring tasks",
    description: "Weekly readings and daily habits reschedule themselves automatically.",
  },
  {
    icon: BarChart3,
    title: "Analytics & streaks",
    description: "See completion trends over time and keep your daily streak alive.",
  },
  {
    icon: Command,
    title: "Keyboard-first",
    description: "A command palette, inline editing, and shortcuts keep you moving fast.",
  },
];

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/tasks");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b-2 border-gold-500 bg-brand-950">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5 text-white">
            <GraduationCap className="h-6 w-6 text-gold-400" />
            <span className="font-serif text-lg font-semibold tracking-wide">
              Student Task Manager
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="border-brand-600 bg-transparent text-brand-100 hover:bg-brand-900 hover:text-white"
              >
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Create account</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h1 className="font-serif text-4xl font-semibold leading-tight text-navy-900 sm:text-5xl">
            Keep every assignment, every deadline, in one place.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-navy-500">
            A task manager built for the rhythm of academic life — courses, recurring
            readings, group project deadlines, and everything in between.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/register">
              <Button size="default" className="h-11 px-6 text-base">
                Get started free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="default" className="h-11 px-6 text-base">
                Sign in
              </Button>
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-t-2 border-t-gold-500 p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-50">
                  <Icon className="h-4 w-4 text-navy-700" />
                </div>
                <h3 className="mt-3 font-serif text-lg font-semibold text-navy-900">{title}</h3>
                <p className="mt-1 text-sm text-navy-500">{description}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-navy-100 py-6 text-center text-sm text-navy-400">
        Built for students, by students.
      </footer>
    </div>
  );
}
