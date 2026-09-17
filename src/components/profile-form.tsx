"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { accountUpdateSchema, type AccountFormValues } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ProfileForm({ name }: { name: string }) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountUpdateSchema),
    defaultValues: { name, currentPassword: "", newPassword: "" },
  });

  const onSubmit = async (values: AccountFormValues) => {
    setSubmitting(true);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      toast.error(data.error ?? "Something went wrong");
      return;
    }

    toast.success("Profile updated");
    reset({ name: data.user.name, currentPassword: "", newPassword: "" });
  };

  return (
    <Card className="p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-700">Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="settings-name" className="mb-1 block text-sm font-medium text-navy-700">
            Name
          </label>
          <Input id="settings-name" {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-maroon-600">{errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="current-password"
              className="mb-1 block text-sm font-medium text-navy-700"
            >
              Current password
            </label>
            <Input
              id="current-password"
              type="password"
              placeholder="Only if changing password"
              {...register("currentPassword")}
            />
          </div>
          <div>
            <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-navy-700">
              New password
            </label>
            <Input
              id="new-password"
              type="password"
              placeholder="Leave blank to keep current"
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="mt-1 text-xs text-maroon-600">{errors.newPassword.message}</p>
            )}
          </div>
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}
