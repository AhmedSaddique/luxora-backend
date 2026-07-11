import { z } from "zod";

const status = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const createTestimonialSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  designation: z.string().trim().min(1, "Designation is required"),
  rating: z.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5"),
  description: z.string().trim().min(1, "Description is required"),
  status: status.optional(),
});

export const updateTestimonialSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    designation: z.string().trim().min(1).optional(),
    rating: z.number().int().min(1).max(5).optional(),
    description: z.string().trim().min(1).optional(),
    status: status.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });
