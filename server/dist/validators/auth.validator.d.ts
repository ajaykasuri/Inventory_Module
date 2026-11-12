import { z } from "zod";
export declare const signupSchema: z.ZodObject<{
    organizationName: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginInput = z.infer<typeof loginSchema>;
export declare const refreshSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, z.core.$strip>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
//# sourceMappingURL=auth.validator.d.ts.map