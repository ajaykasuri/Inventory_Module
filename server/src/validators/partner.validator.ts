import { z } from "zod";
import { itemQuerySchema } from "./catalog.validator.js";

const optionalText = (max: number) =>
  z.string().trim().max(max).nullish().transform((v) => v || null);

export const partnerSchema = z.object({
  name: z.string().trim().min(1).max(150),
  contactPerson: optionalText(120),
  // An empty box is allowed; anything typed must be a real email.
  email: z
    .union([z.literal(""), z.string().trim().toLowerCase().email().max(190)])
    .nullish()
    .transform((v) => v || null),
  phone: optionalText(30),
  address: optionalText(300),
  taxId: z.string().trim().max(30).nullish().transform((v) => (v ? v.toUpperCase() : null)),
  paymentTermsDays: z.number().int().min(0).max(365).default(0),
  notes: optionalText(1000),
});
export type PartnerInput = z.infer<typeof partnerSchema>;

// Same search, active filter and paging as items, without the category filter.
export const partnerQuerySchema = itemQuerySchema.omit({ categoryId: true });
export type PartnerQuery = z.infer<typeof partnerQuerySchema>;