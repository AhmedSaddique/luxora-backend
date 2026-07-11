import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("A valid email is required"),
  phone: z.string().trim().min(1, "Phone is required"),
  whatsapp: z.string().trim().min(1, "WhatsApp number is required"),
  message: z.string().trim().min(1, "Message is required"),
});
