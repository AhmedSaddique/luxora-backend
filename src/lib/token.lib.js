import createError from "http-errors";
import jwt from "jsonwebtoken";

import { env } from "#config/index.js";

const { JWT_SECRET } = env;

const EXPIRY = {
  accessToken: "7d",
  passwordResetToken: "15m",
};

export const tokenUtils = {
  generate: (payload, tokenType) => {
    const expiresIn = EXPIRY[tokenType];
    if (!expiresIn) throw createError(400, "Invalid token type specified.");
    if (!JWT_SECRET) throw createError(500, "JWT secret key is undefined.");
    return jwt.sign(payload, JWT_SECRET, { algorithm: "HS256", expiresIn });
  },

  verify: (token) => {
    if (!JWT_SECRET) throw createError(500, "JWT secret key is undefined.");
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      throw createError(401, "Invalid or expired token.");
    }
  },

  decode: (token) => {
    const decoded = jwt.decode(token);
    if (!decoded) throw createError(401, "Invalid token.");
    return decoded;
  },
};
