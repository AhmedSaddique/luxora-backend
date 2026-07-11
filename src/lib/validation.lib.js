import createError from "http-errors";

/** Validate a payload against a zod schema, throwing a 400 on failure. */
export const validate = (schema, payload) => {
  const result = schema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join(".") || "input"}: ${issue.message}`)
      .join(", ");
    throw createError(400, `Validation error: ${message}`);
  }

  return result.data;
};
