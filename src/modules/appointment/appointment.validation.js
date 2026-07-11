import { z } from "zod";

export const createAppointmentSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("A valid email is required"),
  phone: z.string().trim().min(1, "Phone is required"),
  whatsapp: z.string().trim().optional().nullable(),
  availableTime: z.string().trim().min(1, "Preferred time is required"),
  emirate: z.string().trim().min(1, "Emirate is required"),
  area: z.string().trim().min(1, "Area is required"),
  message: z.string().trim().optional().nullable(),
  shutterTypes: z.array(z.string()).optional().default([]),
});
