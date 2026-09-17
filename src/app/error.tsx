"use client";

import { useEffect } from "react";
import { GraduationCap, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-20">
      <Card className="w-full max-w-sm border-t-4 border-gold-500 p-8 text-center">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-900">
            <GraduationCap className="h-6 w-6 text-gold-400" />
          </div>
        </div>
        <h1 className="mt-4 font-serif text-xl font-semibold text-navy-900">
          Something went wrong
        </h1>
        <p className="mt-1 text-sm text-navy-400">
          An unexpected error occurred. You can try again, or head back to the dashboard.
        </p>
        <Button onClick={reset} className="mt-6">
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
      </Card>
    </div>
  );
}
