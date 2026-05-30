import { sendError } from "../utils/response.js";

const formatZodErrors = (issues) =>
  issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ");

export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const payload =
      source === "body"
        ? req.body
        : source === "query"
          ? req.query
          : req.params;

    const result = schema.safeParse(payload);

    if (!result.success)
      return sendError(res, 400, formatZodErrors(result.error.issues), req.id);

    if (source === "body") req.body = result.data;
    else if (source === "query") req.validatedQuery = result.data;
    else req.validatedParams = result.data;

    next();
  };

export default validate;
