import { z } from "zod";

const money = z.number().min(0).max(999999999999.99);

export const unitSchema = z.object({
  name: z.string().trim().min(1).max(60),
  abbreviation: z.string().trim().min(1).max(12),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const itemSchema = z.object({
  sku: z.string().trim().min(1).max(60),
  name: z.string().trim().min(1).max(190),
  description: z.string().trim().max(2000).nullish(),
  categoryId: z.number().int().positive().nullish(),
  unitId: z.number().int().positive(),
  trackingType: z.enum(["none", "batch", "serial"]).default("none"),
  barcode: z.string().trim().max(80).nullish().transform((v) => v || null),
  costPrice: money.default(0),
  sellingPrice: money.default(0),
  taxRate: z.number().min(0).max(100).default(0),
  reorderLevel: z.number().min(0).default(0),
});
export type ItemInput = z.infer<typeof itemSchema>;

// Query string values arrive as text, so z.coerce turns "2" into 2.
export const itemQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  active: z.enum(["active", "inactive", "all"]).default("active"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ItemQuery = z.infer<typeof itemQuerySchema>;

export const activeSchema = z.object({ isActive: z.boolean() });
export const idSchema = z.coerce.number().int().positive();