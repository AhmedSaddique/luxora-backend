import { z } from "zod";

const imageSchema = z
  .object({ imageUrl: z.string(), altText: z.string().optional() })
  .passthrough();

const status = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
  breadcrumb: z.string().trim().min(1, "Breadcrumb is required"),
  bannerImage: imageSchema.optional(),
  path: z.string().trim().optional(),
  posterImage: imageSchema.optional(),
  metaTitle: z.string().trim().min(1, "Meta title is required"),
  metaDescription: z.string().trim().min(1, "Meta description is required"),
  canonicalUrl: z.string().trim().min(1, "Canonical URL is required"),
  seoSchema: z.string().trim().optional().nullable(),
  status: status.optional(),
});

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    breadcrumb: z.string().trim().min(1).optional(),
    bannerImage: imageSchema.optional(),
    path: z.string().trim().optional(),
    posterImage: imageSchema.optional(),
    metaTitle: z.string().trim().min(1).optional(),
    metaDescription: z.string().trim().min(1).optional(),
    canonicalUrl: z.string().trim().min(1).optional(),
    seoSchema: z.string().trim().optional().nullable(),
    status: status.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });
