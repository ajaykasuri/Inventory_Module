import type { Request, Response } from "express";
import * as svc from "../services/catalog.service.js";
import {
  activeSchema, categorySchema, idSchema, itemQuerySchema, itemSchema, unitSchema,
} from "../validators/catalog.validator.js";

const org = (req: Request) => req.auth!.organizationId;
const seesPrices = (req: Request) => req.auth!.permissions.includes("item.price.view");

export const listUnits = async (req: Request, res: Response) => {
  res.json(await svc.listUnits(org(req)));
};
export const createUnit = async (req: Request, res: Response) => {
  res.status(201).json(await svc.createUnit(org(req), unitSchema.parse(req.body)));
};

export const listCategories = async (req: Request, res: Response) => {
  res.json(await svc.listCategories(org(req)));
};
export const createCategory = async (req: Request, res: Response) => {
  res.status(201).json(await svc.createCategory(org(req), categorySchema.parse(req.body)));
};
export const renameCategory = async (req: Request, res: Response) => {
  res.json(await svc.renameCategory(org(req), idSchema.parse(req.params.id), categorySchema.parse(req.body)));
};
export const deleteCategory = async (req: Request, res: Response) => {
  await svc.deleteCategory(org(req), idSchema.parse(req.params.id));
  res.status(204).end();
};

export const listItems = async (req: Request, res: Response) => {
  res.json(await svc.listItems(org(req), seesPrices(req), itemQuerySchema.parse(req.query)));
};
export const getItem = async (req: Request, res: Response) => {
  res.json(await svc.getItem(org(req), seesPrices(req), idSchema.parse(req.params.id)));
};
export const createItem = async (req: Request, res: Response) => {
  res.status(201).json(await svc.createItem(org(req), seesPrices(req), itemSchema.parse(req.body)));
};
export const updateItem = async (req: Request, res: Response) => {
  res.json(await svc.updateItem(org(req), seesPrices(req), idSchema.parse(req.params.id), itemSchema.parse(req.body)));
};
export const setItemActive = async (req: Request, res: Response) => {
  const { isActive } = activeSchema.parse(req.body);
  res.json(await svc.setItemActive(org(req), idSchema.parse(req.params.id), isActive));
};