"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";
import { loginSchema, type LoginFormValues } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    const result = await signIn("credentials", { ...values, redirect: false });
    setLoading(false);

    if (result?.error) {
      toast.error("Invalid email or password");
      return;
    }

    router.push("/tasks");
    router.refresh();
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
          Welcome back
        </h1>
        <p className="mt-1 text-center text-sm text-navy-400">Sign in to manage your tasks.</p>

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
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-navy-700">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs font-medium text-gold-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" placeholder="********" {...register("password")} />
            {errors.password && (
              <p className="mt-1 text-xs text-maroon-600">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-navy-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-gold-600 hover:underline">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
