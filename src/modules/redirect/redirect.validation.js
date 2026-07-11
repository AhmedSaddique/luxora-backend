import { z } from "zod";

/**
 * Normalize a source path so lookups are consistent regardless of how the
 * URL was entered. Strips an optional origin, ensures a single leading slash,
 * and removes any trailing slash.
 *   "https://shutters.ae/solid-panel-plantation-shutters/" -> "/solid-panel-plantation-shutters"
 *   "solid-panel-plantation-shutters"                      -> "/solid-panel-plantation-shutters"
 */
export const normalizePath = (value) => {
  if (typeof value !== "string") return value;
  let path = value.trim();
  // Drop an absolute origin (protocol + host) if present.
  const originMatch = path.match(/^https?:\/\/[^/]+(\/.*)?$/i);
  if (originMatch) path = originMatch[1] || "/";
  // Ensure a single leading slash.
  path = "/" + path.replace(/^\/+/, "");
  // Drop trailing slash (but keep the root "/").
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return path;
};

/**
 * Normalize a destination. Absolute URLs are kept verbatim; relative paths get
 * the same leading-slash / no-trailing-slash treatment as the source.
 */
export const normalizeTarget = (value) => {
  if (typeof value !== "string") return value;
  const target = value.trim();
  if (/^https?:\/\//i.test(target)) return target;
  return normalizePath(target);
};

const statusCode = z
  .number()
  .int()
  .refine((n) => n === 301 || n === 302, "Status code must be 301 or 302");

export const createRedirectSchema = z
  .object({
    fromPath: z
      .string()
      .trim()
      .min(1, "Old URL is required")
      .transform(normalizePath),
    toPath: z
      .string()
      .trim()
      .min(1, "New URL is required")
      .transform(normalizeTarget),
    statusCode: statusCode.optional(),
  })
  .refine((data) => data.fromPath !== data.toPath, {
    message: "Old and new URL cannot be the same",
    path: ["toPath"],
  });

export const updateRedirectSchema = z
  .object({
    fromPath: z.string().trim().min(1).transform(normalizePath).optional(),
    toPath: z.string().trim().min(1).transform(normalizeTarget).optional(),
    statusCode: statusCode.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });
