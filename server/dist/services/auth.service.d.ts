import type { SignupInput } from "../validators/auth.validator.js";
import type { LoginInput } from "../validators/auth.validator.js";
export declare function signup(input: SignupInput): Promise<{
    organizationId: number;
    userId: number;
    name: string;
    email: string;
}>;
export declare function login(input: LoginInput): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}>;
export declare function refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
}>;
export declare function logout(refreshToken: string): Promise<void>;
//# sourceMappingURL=auth.service.d.ts.map