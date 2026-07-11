import createError from "http-errors";

import { env } from "#config/index.js";

const { NODE_ENV, BACKEND_URL } = env;

/**
 * Wrap a resolver so any thrown / rejected error becomes a proper http-error
 * (preserving the original status code where available).
 */
export const handlePromise =
  (fn) =>
  (...args) => {
    try {
      const result = fn(...args);
      if (result && typeof result.then === "function") {
        return result.catch((error) => {
          throw createError(error.status || error.statusCode || 500, error.message);
        });
      }
      return result;
    } catch (error) {
      throw createError(error.status || error.statusCode || 500, error.message);
    }
  };

/** Convert any string into a url-safe slug. */
export const slugify = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const getServerInfo = () =>
  `
⚙️  Shutters Backend (Express + Apollo + Prisma)
- Environment: ${NODE_ENV}
➜  GraphQL: ${BACKEND_URL}/graphql
`.trim();
