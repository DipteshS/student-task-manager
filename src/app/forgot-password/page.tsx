"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { passwordResetRequestSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type FormValues = { email: string };

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(passwordResetRequestSchema) });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setMessage(null);
    setResetUrl(null);

    const res = await fetch("/api/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error ?? "Something went wrong");
      return;
    }

    setMessage(data.message);
    if (data.resetUrl) setResetUrl(data.resetUrl);
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm border-t-4 border-gold-500 p-8">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-900">
            <GraduationCap className="h-6 w-6 text-gold-400" />
          </div>
        </div>
        <h1 className="mt-4 text-center font-serif text-2xl font-semibold text-navy-900">
          Reset your password
        </h1>
        <p className="mt-1 text-center text-sm text-navy-400">
          Enter your account email and we&apos;ll generate a reset link.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy-700">
              Email
            </label>
            <Input id="email" type="email" placeholder="you@school.edu" {...register("email")} />
            {errors.email && (
              <p className="mt-1 text-xs text-maroon-600">{errors.email.message}</p>
            )}
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        {message && <p className="mt-4 text-sm text-navy-600">{message}</p>}

        {resetUrl && (
          <div className="mt-3 rounded-md border border-gold-100 bg-gold-100/40 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gold-600">
              Dev mode — no email provider configured
            </p>
            <Link
              href={resetUrl}
              className="mt-1 block truncate text-sm font-medium text-navy-900 underline"
            >
              {resetUrl}
            </Link>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-navy-400">
          <Link href="/login" className="font-medium text-gold-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
