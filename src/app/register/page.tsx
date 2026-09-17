"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";
import { registerSchema, type RegisterFormValues } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setLoading(false);
      toast.error(data.error ?? "Something went wrong");
      return;
    }

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      toast.success("Account created. Please sign in.");
      router.push("/login");
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
          Create an account
        </h1>
        <p className="mt-1 text-center text-sm text-navy-400">Start organizing your tasks.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-navy-700">
              Name
            </label>
            <Input id="name" placeholder="Jane Doe" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-maroon-600">{errors.name.message}</p>}
          </div>
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
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-navy-700">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-maroon-600">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-navy-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-gold-600 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
