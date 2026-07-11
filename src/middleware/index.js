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

  let accessToken = req.cookies?.accessToken;
  if (!accessToken && req.headers.authorization?.startsWith("Bearer ")) {
    accessToken = req.headers.authorization.slice(7);
  }

  if (accessToken) {
    try {
      const { id } = tokenUtils.verify(accessToken);
      if (id) {
        user = await prisma.admin.findUnique({
          where: { id },
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

  return { user, req, res };
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
