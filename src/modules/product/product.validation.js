import { z } from "zod";

const imageSchema = z
  .object({ imageUrl: z.string(), altText: z.string().optional() })
  .passthrough();

const status = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const createProductSchema = z.object({
  categoryId: z.string().uuid("A valid category is required"),
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
  breadcrumb: z.string().trim().min(1, "Breadcrumb is required"),
  bannerImage: imageSchema.optional(),
  path: z.string().trim().optional(),
  posterImage: imageSchema.optional(),
  firstImage: imageSchema.optional(),
  firstHeading: z.string().trim().min(1, "First heading is required"),
  firstSubTitle: z.string().trim().min(1, "First subtitle is required"),
  firstDescription: z.string().trim().min(1, "First description is required"),
  secondImage: imageSchema.optional(),
  secondHeading: z.string().trim().min(1, "Second heading is required"),
  secondSubTitle: z.string().trim().min(1, "Second subtitle is required"),
  secondDescription: z.string().trim().min(1, "Second description is required"),
  imageHeading: z.string().trim().optional().nullable(),
  productImages: z.array(z.any()).optional(),
  faq: z.array(z.any()).optional(),
  metaTitle: z.string().trim().optional().nullable(),
  metaDescription: z.string().trim().optional().nullable(),
  canonicalUrl: z.string().trim().optional().nullable(),
  seoSchema: z.string().trim().optional().nullable(),
  status: status.optional(),
});

export const updateProductSchema = z
  .object({
    categoryId: z.string().uuid().optional(),
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    breadcrumb: z.string().trim().min(1).optional(),
    bannerImage: imageSchema.optional(),
    path: z.string().trim().optional(),
    posterImage: imageSchema.optional(),
    firstImage: imageSchema.optional(),
    firstHeading: z.string().trim().min(1).optional(),
    firstSubTitle: z.string().trim().min(1).optional(),
    firstDescription: z.string().trim().min(1).optional(),
    secondImage: imageSchema.optional(),
    secondHeading: z.string().trim().min(1).optional(),
    secondSubTitle: z.string().trim().min(1).optional(),
    secondDescription: z.string().trim().min(1).optional(),
    imageHeading: z.string().trim().optional().nullable(),
    productImages: z.array(z.any()).optional(),
    faq: z.array(z.any()).optional(),
    metaTitle: z.string().trim().optional().nullable(),
    metaDescription: z.string().trim().optional().nullable(),
    canonicalUrl: z.string().trim().optional().nullable(),
    seoSchema: z.string().trim().optional().nullable(),
    status: status.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });
