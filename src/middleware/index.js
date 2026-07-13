import cors from "cors";
import helmet from "helmet";
import express from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import { expressMiddleware } from "@as-integrations/express5";

import { corsOptions } from "./cors.js";
import { apiRateLimiter } from "./rate-limiter.js";
import { prisma, tokenUtils } from "#lib/index.js";

/**
 * Build the GraphQL context for each request: resolve the authenticated admin
 * from the access token (cookie first, Authorization header as a fallback).
 */
const buildContext = async ({ req, res }) => {
  let user = null;
  let customer = null;

  let accessToken = req.cookies?.accessToken;
  if (!accessToken && req.headers.authorization?.startsWith("Bearer ")) {
    accessToken = req.headers.authorization.slice(7);
  }

  if (accessToken) {
    try {
      const decoded = tokenUtils.verify(accessToken);
      // Only admin tokens (no customer type marker) resolve an admin.
      if (decoded.id && decoded.type !== "customer") {
        user = await prisma.admin.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            permissions: true,
          },
        });
      }
    } catch {
      user = null;
    }
  }

  // Customer (storefront) token — kept separate from the admin session.
  let customerToken = req.cookies?.customerToken || req.headers["x-customer-token"];
  if (customerToken) {
    try {
      const decoded = tokenUtils.verify(customerToken);
      if (decoded.id && decoded.type === "customer") {
        customer = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, name: true, email: true, phone: true, createdAt: true },
        });
      }
    } catch {
      customer = null;
    }
  }

  return { user, customer, req, res };
};

export const setupMiddleware = (app, apolloServer) => {
  // Behind Vercel's proxy every request carries X-Forwarded-For; trust the
  // first proxy hop so req.ip is correct and express-rate-limit doesn't error.
  app.set("trust proxy", 1);

  app.use(helmet()); // secure HTTP headers
  app.use(compression()); // gzip responses
  app.use(cookieParser()); // parse cookies
  app.use(cors(corsOptions)); // cross-origin + credentials

  app.use(
    "/graphql",
    apiRateLimiter,
    express.json({ limit: "10mb" }),
    expressMiddleware(apolloServer, { context: buildContext })
  );
};
