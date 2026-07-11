import { z } from "zod";

const imageSchema = z
  .object({ imageUrl: z.string(), altText: z.string().optional() })
  .passthrough();

const status = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const createBlogSchema = z.object({
  categoryId: z.string().uuid("A valid category is required"),
  title: z.string().trim().min(1, "Title is required"),
  path: z.string().trim().optional(),
  posterImage: imageSchema,
  bannerImage: imageSchema,
  content: z.string().trim().min(1, "Content is required"),
  metaTitle: z.string().trim().optional().nullable(),
  metaDescription: z.string().trim().optional().nullable(),
  canonicalUrl: z.string().trim().optional().nullable(),
  imageAltText: z.string().trim().optional().nullable(),
  seoSchema: z.string().trim().optional().nullable(),
  status: status.optional(),
});

export const updateBlogSchema = z
  .object({
    categoryId: z.string().uuid().optional(),
    title: z.string().trim().min(1).optional(),
    path: z.string().trim().optional(),
    posterImage: imageSchema.optional(),
    bannerImage: imageSchema.optional(),
    content: z.string().trim().min(1).optional(),
    metaTitle: z.string().trim().optional().nullable(),
    metaDescription: z.string().trim().optional().nullable(),
    canonicalUrl: z.string().trim().optional().nullable(),
    imageAltText: z.string().trim().optional().nullable(),
    seoSchema: z.string().trim().optional().nullable(),
    status: status.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });
