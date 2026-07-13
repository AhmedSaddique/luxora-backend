import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: z.string().trim().min(6, "A valid phone number is required"),
  addressLine: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
  area: z.string().trim().optional().nullable(),
  isDefault: z.boolean().optional(),
});

export const createOrderSchema = z
  .object({
    customerName: z.string().trim().optional().nullable(),
    email: z.string().trim().toLowerCase().email("A valid email is required"),
    phone: z.string().trim().optional().nullable(),
    addressLine: z.string().trim().optional().nullable(),
    city: z.string().trim().optional().nullable(),
    area: z.string().trim().optional().nullable(),
    note: z.string().trim().optional().nullable(),
    addressId: z.string().uuid().optional().nullable(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid("Invalid product"),
          quantity: z.number().int().min(1, "Quantity must be at least 1"),
        })
      )
      .min(1, "Your cart is empty"),
  })
  .refine(
    (d) =>
      d.addressId ||
      (d.customerName && d.phone && d.addressLine && d.city),
    { message: "A delivery address is required." }
  );
