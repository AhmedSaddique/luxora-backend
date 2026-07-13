import dotenv from "dotenv";
import { cleanEnv, str, port, email, url, testOnly } from "envalid";

dotenv.config();

// Be forgiving about URL env vars: if a host is provided without a protocol
// (e.g. "my-app.vercel.app"), assume https:// so strict url() validation and
// CORS origin matching still work. Prevents a hard crash on misconfigured envs.
for (const key of ["BACKEND_URL", "FRONTEND_URL", "DASHBOARD_URL"]) {
  const value = process.env[key];
  if (value && !/^https?:\/\//i.test(value.trim())) {
    process.env[key] = `https://${value.trim().replace(/^\/+/, "")}`;
  }
}

const validators = {
  NODE_ENV: str({
    choices: ["development", "test", "production"],
    default: "development",
    desc: "Environment type",
  }),

  PORT: port({ default: 5000, desc: "Port number" }),

  BACKEND_URL: url({ desc: "Backend URL" }),
  FRONTEND_URL: url({ desc: "Public website URL" }),
  // Plain default (not devDefault): only feeds the CORS whitelist — must
  // never crash the boot.
  DASHBOARD_URL: url({
    default: "http://localhost:3000",
    desc: "Admin dashboard URL",
  }),

  DATABASE_URL: url({ desc: "Database connection string" }),

  JWT_SECRET: str({
    devDefault: testOnly("test-secret"),
    desc: "JWT secret key",
  }),

  // Mail (SMTP) configuration — contact-form emails are sent from this account
  EMAIL_HOST: str({ default: "smtp.gmail.com", desc: "SMTP host" }),
  EMAIL_PORT: port({ default: 587, desc: "SMTP port" }),
  USER_EMAIL: email({ desc: "SMTP / sender email address" }),
  USER_PASSWORD: str({ desc: "SMTP password (app password for Gmail)" }),

  // Company inboxes that receive new contact notifications
  ORDER_MAIL1: str({ default: "", desc: "Notification inbox 1" }),
  ORDER_MAIL2: str({ default: "", desc: "Notification inbox 2" }),

  // Redis (optional — falls back to in-memory cache if unavailable)
  REDIS_URL: str({ default: "", desc: "Redis connection string" }),

  // Bootstrap super admin (created via `npm run db:seed`)
  SUPER_ADMIN_NAME: str({ default: "Super Admin", desc: "Bootstrap super admin name" }),
  SUPER_ADMIN_EMAIL: email({ desc: "Bootstrap super admin email" }),
  SUPER_ADMIN_PASSWORD: str({ desc: "Bootstrap super admin password" }),
};

export const env = cleanEnv(process.env, validators, {
  reporter: ({ errors }) => {
    const invalidVars = Object.keys(errors);
    if (invalidVars.length > 0) {
      console.error(
        `\nInvalid / missing environment variables:\n- ${invalidVars.join(
          "\n- "
        )}\n\nPlease set the above variables correctly in your .env file.\n`
      );
      process.exit(1);
    }
  },
});

/** Strip stray quotes / commas / whitespace from an env value. */
const cleanEmail = (v) => (v || "").replace(/^[\s",]+|[\s",]+$/g, "").trim();

/** Company inboxes that receive contact-form notifications. */
export const NOTIFICATION_RECIPIENTS = [env.ORDER_MAIL1, env.ORDER_MAIL2]
  .map(cleanEmail)
  .filter(Boolean);
