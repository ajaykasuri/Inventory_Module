import type { Request, Response } from "express";
export declare const listUnits: (req: Request, res: Response) => Promise<void>;
export declare const createUnit: (req: Request, res: Response) => Promise<void>;
export declare const listCategories: (req: Request, res: Response) => Promise<void>;
export declare const createCategory: (req: Request, res: Response) => Promise<void>;
export declare const renameCategory: (req: Request, res: Response) => Promise<void>;
export declare const deleteCategory: (req: Request, res: Response) => Promise<void>;
export declare const listItems: (req: Request, res: Response) => Promise<void>;
export declare const getItem: (req: Request, res: Response) => Promise<void>;
export declare const createItem: (req: Request, res: Response) => Promise<void>;
export declare const updateItem: (req: Request, res: Response) => Promise<void>;
export declare const setItemActive: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=catalog.controller.d.ts.map