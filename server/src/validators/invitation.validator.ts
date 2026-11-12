import { z } from "zod";

export const createInvitationSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(190),
  roleId: z.number().int().positive(),
});
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

export const acceptInvitationSchema = z.object({
  token: z.string().min(20),
  name: z.string().trim().min(2).max(120),
  password: z.string().min(8).max(100),
});
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;