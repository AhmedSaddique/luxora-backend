import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import createError from "http-errors";
import path, { dirname, join } from "path";
import { readFile, access, constants } from "fs/promises";

import { logger } from "./logger.lib.js";
import { env } from "#config/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const VIEWS_DIRECTORY = path.join(__dirname, "../views");
const { NODE_ENV, USER_EMAIL, USER_PASSWORD, EMAIL_HOST, EMAIL_PORT } = env;

const SENDER_EMAIL = USER_EMAIL;
const SENDER_PASS = USER_PASSWORD;

const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465, // implicit TLS on 465, STARTTLS otherwise
    auth: { user: SENDER_EMAIL, pass: SENDER_PASS },
    connectionTimeout: 10000,
    socketTimeout: 10000,
  });

  transporter.verify((error) => {
    if (error) {
      logger.error(`[mail] Transporter connection failed: ${error.message}`);
    }
  });

  return transporter;
};

const transporter = createTransporter();

// HTML email templates available under src/views/<type>/index.html
const SUPPORTED_HTML_TEMPLATES = [
  "contact-customer",
  "contact-admin",
  "reset-password",
  "order-confirmation",
];

const templateCache = new Map();

const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getEmailTemplate = async (type) => {
  const cacheKey = `${type}/index.html`;
  if (templateCache.has(cacheKey)) return templateCache.get(cacheKey);

  const filePath = join(VIEWS_DIRECTORY, type, "index.html");
  try {
    await access(filePath, constants.R_OK);
    const template = await readFile(filePath, "utf-8");
    templateCache.set(cacheKey, template);
    return template;
  } catch (error) {
    throw createError(
      500,
      `Failed to load email template "${type}/index.html": ${error.message}`
    );
  }
};

const processTemplate = (template, variables) => {
  let processed = template;
  for (const [key, value] of Object.entries(variables)) {
    // Keys ending in "Html" are inserted as raw markup (e.g. a <li> list);
    // everything else is HTML-escaped.
    const replacement = key.endsWith("Html")
      ? String(value ?? "")
      : escapeHtml(value ?? "");
    processed = processed.replace(new RegExp(`\\$\\{${key}\\}`, "g"), replacement);
  }
  // Clear any unmatched placeholders so they never leak into the email.
  processed = processed.replace(/\$\{.+?\}/g, "");
  return processed;
};

const sendMail = async ({ to, subject, html }) => {
  try {
    return await transporter.sendMail({
      from: `Luxora Collection <${SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    // Log the real SMTP failure (visible in Vercel function logs); the
    // client only ever sees the generic message below.
    logger.error(`[mail] send failed (to: ${to}): ${error.message}`);
    if (NODE_ENV !== "production") console.error("[Email Send Error]", error);
    throw createError(500, "Failed to send email.");
  }
};

/**
 * Render an HTML template and send it.
 * @param {string} type one of SUPPORTED_HTML_TEMPLATES
 * @param {object} options { to: string|string[], subject: string, ...templateVars }
 */
export const sendEmail = async (type, { to, subject, ...variables }) => {
  if (!SUPPORTED_HTML_TEMPLATES.includes(type)) {
    throw createError(
      400,
      `Invalid email type "${type}". Supported: ${SUPPORTED_HTML_TEMPLATES.join(", ")}`
    );
  }

  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (!recipients.length) return null;
  if (!subject) throw createError(400, "Email subject is required.");

  const template = await getEmailTemplate(type);
  const html = processTemplate(template, variables);

  return sendMail({ to: recipients.join(","), subject, html });
};
