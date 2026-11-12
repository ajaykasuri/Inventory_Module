import type { Request, Response } from "express";
import * as svc from "../services/partner.service.js";
import type { PartnerType } from "../services/partner.service.js";
import { activeSchema, idSchema } from "../validators/catalog.validator.js";
import { partnerQuerySchema, partnerSchema } from "../validators/partner.validator.js";

const org = (req: Request) => req.auth!.organizationId;
const id = (req: Request) => idSchema.parse(req.params.id);

// Builds the five handlers for one type. Suppliers and customers each get a set.
export function partnerHandlers(type: PartnerType) {
  return {
    list: async (req: Request, res: Response) => {
      res.json(await svc.listPartners(org(req), type, partnerQuerySchema.parse(req.query)));
    },
    get: async (req: Request, res: Response) => {
      res.json(await svc.getPartner(org(req), type, id(req)));
    },
    create: async (req: Request, res: Response) => {
      res.status(201).json(await svc.createPartner(org(req), type, partnerSchema.parse(req.body)));
    },
    update: async (req: Request, res: Response) => {
      res.json(await svc.updatePartner(org(req), type, id(req), partnerSchema.parse(req.body)));
    },
    setActive: async (req: Request, res: Response) => {
      res.json(await svc.setPartnerActive(org(req), type, id(req), activeSchema.parse(req.body).isActive));
    },
  };
}