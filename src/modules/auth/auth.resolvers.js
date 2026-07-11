import createError from "http-errors";

import { env } from "#config/index.js";
import {
  prisma,
  bcryptUtils,
  tokenUtils,
  validate,
  verify,
  handlePromise,
  logger,
  ALL_PERMISSIONS,
} from "#lib/index.js";
import {
  signInSchema,
  passwordResetRequestSchema,
  updatePasswordSchema,
} from "./auth.validation.js";

const {
  NODE_ENV,
  SUPER_ADMIN_NAME,
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASSWORD,
} = env;

const cookieOptions = () => ({
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
});

export const authResolvers = {
  Query: {
    me: verify.access((_parent, _args, context) => context.user),
  },

  Mutation: {
    signIn: handlePromise(async (_parent, { input }, context) => {
      const { email, password } = validate(signInSchema, input);

      // Does this match the super admin credentials in .env?
      const isEnvSuperAdmin =
        email === SUPER_ADMIN_EMAIL.toLowerCase() &&
        password === SUPER_ADMIN_PASSWORD;

      let admin;
      try {
        admin = await prisma.admin.findUnique({ where: { email } });
      } catch (error) {
        logger.error(`[auth] DB Error on signIn: ${error.message}`);
        throw createError(401, "invalid credential");
      }

      // Bootstrap the super admin from .env on first login (no manual seeding).
      if (!admin && isEnvSuperAdmin) {
        const hashedPassword = await bcryptUtils.hash(password, { rounds: 12 });
        admin = await prisma.admin.create({
          data: {
            name: SUPER_ADMIN_NAME,
            email: SUPER_ADMIN_EMAIL.toLowerCase(),
            password: hashedPassword,
            role: "SUPER_ADMIN",
            permissions: ALL_PERMISSIONS,
            lastEditedBy: "system",
          },
        });
        logger.info(`[auth] Super admin bootstrapped from env: ${admin.email}`);
      }

      if (!admin) throw createError(401, "invalid credential");

      let isValid = await bcryptUtils.compare(password, admin.password);
      // Accept env super-admin credentials even if the stored hash is stale.
      if (!isValid && isEnvSuperAdmin) isValid = true;
      if (!isValid) throw createError(401, "invalid credential");

      const accessToken = tokenUtils.generate(
        { id: admin.id, role: admin.role },
        "accessToken"
      );

      context.res.cookie("accessToken", accessToken, cookieOptions());

      return {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        accessToken,
      };
    }),

    signOut: handlePromise((_parent, _args, context) => {
      context.res.clearCookie("accessToken", {
        ...cookieOptions(),
        maxAge: undefined,
      });
      return { success: true, message: "Signed out successfully." };
    }),

    passwordResetRequest: handlePromise(async (_parent, { input }) => {
      const { email } = validate(passwordResetRequestSchema, input);

      let admin;
      try {
        admin = await prisma.admin.findUnique({ where: { email } });
      } catch (error) {
        logger.error(`[auth] DB Error on passwordResetRequest: ${error.message}`);
        // Treat as not found to avoid leaking info
      }
      // Always return success to avoid leaking which emails exist.
      if (!admin) {
        return {
          success: true,
          message: "If an account exists, a reset link has been sent.",
        };
      }

      tokenUtils.generate({ id: admin.id }, "passwordResetToken");

      return {
        success: true,
        message: "If an account exists, a reset link has been sent.",
      };
    }),

    updatePassword: handlePromise(async (_parent, { input }) => {
      const { resetToken, password } = validate(updatePasswordSchema, input);

      const { id } = tokenUtils.verify(resetToken);
      if (!id) throw createError(400, "Invalid reset token.");

      const hashedPassword = await bcryptUtils.hash(password, { rounds: 12 });
      await prisma.admin.update({
        where: { id },
        data: { password: hashedPassword },
      });

      return { success: true, message: "Password updated successfully." };
    }),
  },
};
