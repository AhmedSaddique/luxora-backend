import { env, NOTIFICATION_RECIPIENTS } from "#config/index.js";
import { prisma, sendEmail, logger } from "#lib/index.js";

const { FRONTEND_URL } = env;

const sendContactEmails = async (contact) => {
  const vars = {
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    whatsapp: contact.whatsapp,
    message: contact.message,
    FRONTEND_URL,
  };

  // 1) Acknowledgement to the customer
  try {
    await sendEmail("contact-customer", {
      to: contact.email,
      subject: "We received your message - Shutter",
      ...vars,
    });
  } catch (error) {
    logger.error(`[contact] customer email failed: ${error.message}`);
  }

  // 2) Notification to the company inboxes
  if (NOTIFICATION_RECIPIENTS.length) {
    try {
      await sendEmail("contact-admin", {
        to: NOTIFICATION_RECIPIENTS,
        subject: `New contact message from ${contact.name}`,
        ...vars,
      });
    } catch (error) {
      logger.error(`[contact] admin email failed: ${error.message}`);
    }
  }
};

export const contactService = {
  list: () => prisma.contact.findMany({ orderBy: { createdAt: "desc" } }),

  byId: (id) => prisma.contact.findUnique({ where: { id } }),

  create: async (input) => {
    const contact = await prisma.contact.create({ data: input });
    await sendContactEmails(contact);
    return contact;
  },
};
