import crypto from "crypto";
import createError from "http-errors";

import { env } from "#config/index.js";
import { prisma, bcryptUtils, tokenUtils, sendEmail, logger } from "#lib/index.js";

const { FRONTEND_URL } = env;

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  createdAt: user.createdAt,
});

const issueToken = (user) =>
  tokenUtils.generate({ id: user.id, type: "customer" }, "customerAccessToken");

export const customerService = {
  byId: (id) =>
    prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    }),

  register: async (input) => {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw createError(409, "An account with this email already exists.");

    const hashedPassword = await bcryptUtils.hash(input.password, { rounds: 12 });
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        phone: input.phone || null,
      },
    });

    return { ...publicUser(user), accessToken: issueToken(user) };
  },

  login: async ({ email, password }) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw createError(401, "Invalid email or password.");

    const isValid = await bcryptUtils.compare(password, user.password);
    if (!isValid) throw createError(401, "Invalid email or password.");

    return { ...publicUser(user), accessToken: issueToken(user) };
  },

  forgotPassword: async ({ email }) => {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return the same message to avoid leaking which emails exist.
    const genericMessage =
      "If an account exists for that email, a password reset link has been sent.";

    if (!user) return { success: true, message: genericMessage };

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const resetUrl = `${FRONTEND_URL.replace(/\/$/, "")}/reset-password?token=${token}`;

    try {
      await sendEmail("reset-password", {
        to: user.email,
        subject: "Reset your password - Luxora Collection",
        name: user.name,
        resetUrl,
      });
    } catch (error) {
      logger.error(`[customer] reset email failed: ${error.message}`);
    }

    return { success: true, message: genericMessage };
  },

  // Confirms a reset token is valid & unexpired (used by the reset page on load).
  verifyResetToken: async (token) => {
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });
    if (!user) throw createError(400, "This reset link is invalid or has expired.");
    return { success: true, message: "Token is valid." };
  },

  resetPassword: async ({ token, password }) => {
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });
    if (!user) throw createError(400, "This reset link is invalid or has expired.");

    const hashedPassword = await bcryptUtils.hash(password, { rounds: 12 });
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    });

    return { success: true, message: "Password updated successfully. You can now sign in." };
  },

  updateProfile: async (id, input) => {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
      },
    });
    return publicUser(user);
  },
};
