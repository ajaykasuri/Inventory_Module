import type { Request, Response } from "express";
import * as svc from "../services/warehouse.service.js";
import { activeSchema, idSchema } from "../validators/catalog.validator.js";
import {
  activeFilterSchema, locationEditSchema, locationSchema, warehouseSchema,
} from "../validators/warehouse.validator.js";

const org = (req: Request) => req.auth!.organizationId;
const id = (req: Request) => idSchema.parse(req.params.id);

export const listWarehouses = async (req: Request, res: Response) => {
  res.json(await svc.listWarehouses(org(req), activeFilterSchema.parse(req.query.active)));
};
export const getWarehouse = async (req: Request, res: Response) => {
  res.json(await svc.getWarehouse(org(req), id(req)));
};
export const createWarehouse = async (req: Request, res: Response) => {
  res.status(201).json(await svc.createWarehouse(org(req), warehouseSchema.parse(req.body)));
};
export const updateWarehouse = async (req: Request, res: Response) => {
  res.json(await svc.updateWarehouse(org(req), id(req), warehouseSchema.parse(req.body)));
};
export const setWarehouseActive = async (req: Request, res: Response) => {
  res.json(await svc.setWarehouseActive(org(req), id(req), activeSchema.parse(req.body).isActive));
};

export const listLocations = async (req: Request, res: Response) => {
  res.json(await svc.listLocations(org(req), id(req)));
};
export const createLocation = async (req: Request, res: Response) => {
  res.status(201).json(await svc.createLocation(org(req), id(req), locationSchema.parse(req.body)));
};
export const updateLocation = async (req: Request, res: Response) => {
  res.json(await svc.updateLocation(org(req), id(req), locationEditSchema.parse(req.body)));
};
export const setLocationActive = async (req: Request, res: Response) => {
  res.json(await svc.setLocationActive(org(req), id(req), activeSchema.parse(req.body).isActive));
};