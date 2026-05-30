import { z } from "zod";

export const createUrlSchema = z.object({
  originalUrl: z
    .string()
    .trim()
    .refine(
      (value) => {
        try {
          const parsed = new URL(value);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Only HTTP and HTTPS URLs are allowed" },
    ),
  customAlias: z.string().trim().min(3).max(50).optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

export const updateUrlSchema = z
  .object({
    customAlias: z.string().trim().min(3).max(50).optional(),
    expiresAt: z.string().datetime().optional().nullable(),
  })
  .refine(
    (data) => data.customAlias !== undefined || data.expiresAt !== undefined,
    {
      message: "At least one field (customAlias or expiresAt) must be provided",
    },
  );

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().default(""),
});

export const analyticsQuerySchema = z.object({
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
});

export const urlIdParamSchema = z.object({
  id: z.string().uuid("Invalid URL id"),
});

export const qrQuerySchema = z.object({
  format: z.enum(["png", "base64"]).default("png"),
});
