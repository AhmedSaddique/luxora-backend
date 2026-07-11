import { env, NOTIFICATION_RECIPIENTS } from "#config/index.js";
import { prisma, sendEmail, logger } from "#lib/index.js";

const { FRONTEND_URL } = env;

const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Fire-and-log emails; never let a mail failure break the booking. */
const sendAppointmentEmails = async (appointment) => {
  const types = appointment.shutterTypes?.length
    ? appointment.shutterTypes
    : ["Not specified"];
  const shutterTypesHtml = types.map((t) => `<li>${escapeHtml(t)}</li>`).join("");
  const location =
    [appointment.area, appointment.emirate].filter(Boolean).join(", ") || "Not provided";

  const vars = {
    name: appointment.name,
    email: appointment.email,
    phone: appointment.phone,
    whatsapp: appointment.whatsapp || "Not provided",
    location,
    availableTime: appointment.availableTime,
    message: appointment.message || "—",
    shutterTypesHtml,
    FRONTEND_URL,
  };

  // 1) Confirmation to the customer
  try {
    await sendEmail("appointment-customer", {
      to: appointment.email,
      subject: "Appointment Confirmation - Shutter",
      ...vars,
    });
  } catch (error) {
    logger.error(`[appointment] customer email failed: ${error.message}`);
  }

  // 2) Notification to the company inboxes
  if (NOTIFICATION_RECIPIENTS.length) {
    try {
      await sendEmail("appointment-admin", {
        to: NOTIFICATION_RECIPIENTS,
        subject: `New appointment request from ${appointment.name}`,
        ...vars,
      });
    } catch (error) {
      logger.error(`[appointment] admin email failed: ${error.message}`);
    }
  }
};

export const appointmentService = {
  list: () => prisma.appointment.findMany({ orderBy: { createdAt: "desc" } }),

  byId: (id) => prisma.appointment.findUnique({ where: { id } }),

  create: async (input) => {
    const appointment = await prisma.appointment.create({ data: input });
    await sendAppointmentEmails(appointment);
    return appointment;
  },
};
