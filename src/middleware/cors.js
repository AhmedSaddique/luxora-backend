import { env } from "#config/index.js";

const { FRONTEND_URL, DASHBOARD_URL } = env;

// Allowed browser origins (no trailing slash — the Origin header never has one).
const whitelist = [
  ...new Set(
    [
      "https://shutters.ae",
      "https://www.shutters.ae",
      "https://shutters-frontend.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
      FRONTEND_URL,
      DASHBOARD_URL,
    ]
      .filter(Boolean)
      .map((o) => o.replace(/\/$/, "")), // strip any trailing slash
  ),
];

export const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients (curl, Postman, Apollo Sandbox) with no origin.
    if (!origin || whitelist.includes(origin.replace(/\/$/, ""))) {
      return callback(null, true);
    }
    return callback(new Error(`Origin "${origin}" not allowed by CORS.`));
  },
  credentials: true,
};
