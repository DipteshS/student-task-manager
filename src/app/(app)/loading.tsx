import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-24 border-t-2 border-t-gold-100" />
          ))}
        </div>
        <Card className="h-64" />
        <Card className="h-40" />
      </div>
    </main>
  );
}
