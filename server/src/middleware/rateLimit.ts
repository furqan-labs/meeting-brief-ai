import rateLimit from 'express-rate-limit';

// Analyzing calls a paid third-party API using the caller's own key, so we
// keep the limit modest mainly to prevent accidental request storms from
// the client (e.g. a retry loop), not to protect our own API budget.
export const analyzeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a few minutes and try again.' },
});
