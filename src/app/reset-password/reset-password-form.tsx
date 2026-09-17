"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const formSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    const res = await fetch("/api/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: values.password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error ?? "Something went wrong");
      return;
    }

    toast.success("Password updated. Please sign in.");
    router.push("/login");
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
          Choose a new password
        </h1>

        {!token ? (
          <p className="mt-4 text-center text-sm text-maroon-600">
            This link is missing a reset token. Request a new one from the{" "}
            <Link href="/forgot-password" className="underline">
              forgot password
            </Link>{" "}
            page.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-navy-700">
                New password
              </label>
              <Input
                id="new-password"
                type="password"
                placeholder="At least 8 characters"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-maroon-600">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1 block text-sm font-medium text-navy-700"
              >
                Confirm password
              </label>
              <Input id="confirm-password" type="password" {...register("confirmPassword")} />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-maroon-600">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Updating..." : "Update password"}
            </Button>
          </form>
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
