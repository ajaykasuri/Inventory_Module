import type { Request, RequestHandler, Response } from "express";

// Sends any error from an async handler to the error middleware,
// so you do not need try/catch in every controller.
export const wrap =
  (fn: (req: Request, res: Response) => Promise<void>): RequestHandler =>
  (req, res, next) => {
    fn(req, res).catch(next);
  };