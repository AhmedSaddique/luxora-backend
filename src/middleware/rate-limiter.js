import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

export const apiRateLimiter = (req, res, next) => {
  if (req.method === "OPTIONS") return next(); // allow CORS preflight
  return limiter(req, res, next);
};
