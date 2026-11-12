import type { ErrorRequestHandler } from "express";
export declare class AppError extends Error {
    status: number;
    constructor(status: number, message: string);
}
export declare const errorHandler: ErrorRequestHandler;
//# sourceMappingURL=errorHandler.d.ts.map