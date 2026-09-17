"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { GraduationCap, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/tasks", label: "Tasks" },
  { href: "/calendar", label: "Calendar" },
  { href: "/analytics", label: "Analytics" },
];

export function NavBar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <header className="border-b-2 border-gold-500 bg-brand-950">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 text-white">
            <GraduationCap className="h-6 w-6 text-gold-400" />
            <span className="font-serif text-lg font-semibold tracking-wide">
              Student Task Manager
            </span>
          </div>
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-900 text-white"
                      : "text-brand-300 hover:bg-brand-900/60 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-brand-100 sm:inline">{userName}</span>
          <ThemeToggle />
          <Link
            href="/settings"
            aria-label="Settings"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
              pathname === "/settings"
                ? "bg-brand-900 text-white"
                : "text-brand-100 hover:bg-brand-900 hover:text-white"
            )}
          >
            <Settings className="h-4 w-4" />
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="border-brand-600 bg-transparent text-brand-100 hover:bg-brand-900 hover:text-white"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
