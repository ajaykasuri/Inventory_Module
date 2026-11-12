import { z } from "zod";

export const signupSchema = z.object({
  organizationName: z.string().trim().min(2).max(150),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(190),
  password: z.string().min(8).max(100),
});
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(20),
});
export type RefreshInput = z.infer<typeof refreshSchema>;
export type SignupInput = z.infer<typeof signupSchema>;