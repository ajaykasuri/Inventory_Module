import type { AcceptInvitationInput, CreateInvitationInput } from "../validators/invitation.validator.js";
export declare function createInvitation(orgId: number, invitedBy: number, input: CreateInvitationInput): Promise<{
    email: string;
    inviteLink: string;
}>;
export declare function acceptInvitation(input: AcceptInvitationInput): Promise<{
    userId: number;
    email: string;
}>;
//# sourceMappingURL=invitation.service.d.ts.map