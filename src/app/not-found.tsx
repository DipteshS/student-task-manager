import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-20">
      <Card className="w-full max-w-sm border-t-4 border-gold-500 p-8 text-center">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-900">
            <GraduationCap className="h-6 w-6 text-gold-400" />
          </div>
        </div>
        <p className="mt-4 font-serif text-5xl font-semibold text-navy-900">404</p>
        <h1 className="mt-2 font-serif text-xl font-semibold text-navy-900">Page not found</h1>
        <p className="mt-1 text-sm text-navy-400">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button>
            <Home className="h-4 w-4" />
            Back home
          </Button>
        </Link>
      </Card>
    </div>
  );
}
