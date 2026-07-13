import { validate, verify, handlePromise } from "#lib/index.js";
import { customerService } from "./customer.service.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "./customer.validation.js";

const cookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: maxAgeMs,
  path: "/",
});

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export const customerResolvers = {
  Query: {
    myAccount: verify.customer((_p, _a, ctx) => customerService.byId(ctx.customer.id)),
  },

  Mutation: {
    registerUser: handlePromise(async (_p, { input }, ctx) => {
      const data = validate(registerSchema, input);
      const result = await customerService.register(data);
      ctx.res.cookie("customerToken", result.accessToken, cookieOptions(THIRTY_DAYS));
      return result;
    }),

    loginUser: handlePromise(async (_p, { input }, ctx) => {
      const data = validate(loginSchema, input);
      const result = await customerService.login(data);
      ctx.res.cookie("customerToken", result.accessToken, cookieOptions(THIRTY_DAYS));
      return result;
    }),

    logoutUser: handlePromise((_p, _a, ctx) => {
      ctx.res.clearCookie("customerToken", { ...cookieOptions(), maxAge: undefined });
      return { success: true, message: "Signed out successfully." };
    }),

    forgotPassword: handlePromise((_p, { input }) => {
      const data = validate(forgotPasswordSchema, input);
      return customerService.forgotPassword(data);
    }),

    verifyResetToken: handlePromise((_p, { token }) =>
      customerService.verifyResetToken(token)
    ),

    resetPassword: handlePromise((_p, { input }) => {
      const data = validate(resetPasswordSchema, input);
      return customerService.resetPassword(data);
    }),

    updateProfile: handlePromise(
      verify.customer((_p, { input }, ctx) => {
        const data = validate(updateProfileSchema, input);
        return customerService.updateProfile(ctx.customer.id, data);
      })
    ),
  },
};
