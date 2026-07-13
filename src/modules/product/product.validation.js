import { z } from "zod";

const imageSchema = z
  .object({ imageUrl: z.string(), altText: z.string().optional() })
  .passthrough();

const status = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const createProductSchema = z.object({
  categoryId: z.string().uuid("A valid category is required"),
  subcategoryId: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
  breadcrumb: z.string().trim().min(1, "Breadcrumb is required"),
  path: z.string().trim().optional(),
  price: z.number().positive("Price must be greater than 0"),
  discountPrice: z.number().positive().optional().nullable(),
  stock: z.number().int("Stock must be a whole number").min(0, "Stock cannot be negative").optional(),
  posterImage: imageSchema.optional(),
  productImages: z.array(z.any()).optional(),
  additionalInformation: z.array(z.any()).optional(),
  metaTitle: z.string().trim().optional().nullable(),
  metaDescription: z.string().trim().optional().nullable(),
  canonicalUrl: z.string().trim().optional().nullable(),
  seoSchema: z.string().trim().optional().nullable(),
  status: status.optional(),
}).refine(
  (data) => data.discountPrice == null || data.discountPrice < data.price,
  { message: "Discount price must be less than the regular price", path: ["discountPrice"] }
);

export const updateProductSchema = z
  .object({
    categoryId: z.string().uuid().optional(),
    subcategoryId: z.string().uuid().optional().nullable(),
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    breadcrumb: z.string().trim().min(1).optional(),
    path: z.string().trim().optional(),
    price: z.number().positive().optional(),
    discountPrice: z.number().positive().optional().nullable(),
    stock: z.number().int().min(0).optional(),
    posterImage: imageSchema.optional(),
    productImages: z.array(z.any()).optional(),
    additionalInformation: z.array(z.any()).optional(),
    metaTitle: z.string().trim().optional().nullable(),
    metaDescription: z.string().trim().optional().nullable(),
    canonicalUrl: z.string().trim().optional().nullable(),
    seoSchema: z.string().trim().optional().nullable(),
    status: status.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  })
  .refine(
    (data) =>
      data.price == null ||
      data.discountPrice == null ||
      data.discountPrice < data.price,
    {
      message: "Discount price must be less than the regular price",
      path: ["discountPrice"],
    }
  );
