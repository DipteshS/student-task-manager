import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { passwordResetRequestSchema } from "@/lib/validations";
import { withErrorHandling } from "@/lib/api-handler";

const TOKEN_TTL_MS = 60 * 60 * 1000;

export const POST = withErrorHandling(async (request: Request) => {
  const body = await request.json().catch(() => null);
  const parsed = passwordResetRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  const genericMessage =
    "If an account exists for that email, a password reset link has been generated.";

  if (!user) {
    return NextResponse.json({ message: genericMessage });
  }

  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const resetUrl = `/reset-password?token=${token}`;

  console.log(`[password-reset] dev-mode reset link for ${user.email}: ${resetUrl}`);

  return NextResponse.json({ message: genericMessage, resetUrl });
});
