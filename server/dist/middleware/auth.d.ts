import type { NextFunction, Request, RequestHandler, Response } from "express";
export declare function authenticate(req: Request, _res: Response, next: NextFunction): void;
export declare function requirePermission(code: string): RequestHandler;
//# sourceMappingURL=auth.d.ts.map