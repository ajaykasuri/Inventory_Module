import { z } from "zod";
export declare const createInvitationSchema: z.ZodObject<{
    email: z.ZodString;
    roleId: z.ZodNumber;
}, z.core.$strip>;
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export declare const acceptInvitationSchema: z.ZodObject<{
    token: z.ZodString;
    name: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
//# sourceMappingURL=invitation.validator.d.ts.map