import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).nullish().transform((v) => v || null);

export const warehouseSchema = z.object({
  code: z.string().trim().toUpperCase().min(1).max(20),
  name: z.string({ error: "Name is required" }).trim().min(1, "Name is required").max(120),
  address: optionalText(300),
  contactPerson: optionalText(120),
  phone: optionalText(30),
});
export type WarehouseInput = z.infer<typeof warehouseSchema>;

export const locationSchema = z.object({
  type: z.enum(["zone", "rack", "shelf", "bin"]),
  code: z.string().trim().toUpperCase().min(1).max(40),
  description: optionalText(200),
  parentId: z.number().int().positive().nullish(),
});
export type LocationInput = z.infer<typeof locationSchema>;

export const locationEditSchema = z.object({
  code: z.string().trim().toUpperCase().min(1).max(40),
  description: optionalText(200),
});
export type LocationEditInput = z.infer<typeof locationEditSchema>;

export const activeFilterSchema = z.enum(["active", "inactive", "all"]).default("active");