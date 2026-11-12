import type { RowDataPacket } from "mysql2/promise";
import type { ItemInput, ItemQuery } from "../validators/catalog.validator.js";
export declare function listUnits(orgId: number): Promise<RowDataPacket[]>;
export declare function createUnit(orgId: number, input: {
    name: string;
    abbreviation: string;
}): Promise<{
    name: string;
    abbreviation: string;
    id: number;
}>;
export declare function listCategories(orgId: number): Promise<RowDataPacket[]>;
export declare function createCategory(orgId: number, input: {
    name: string;
}): Promise<{
    id: number;
    name: string;
}>;
export declare function renameCategory(orgId: number, id: number, input: {
    name: string;
}): Promise<{
    id: number;
    name: string;
}>;
export declare function deleteCategory(orgId: number, id: number): Promise<void>;
export declare function listItems(orgId: number, canSeePrice: boolean, q: ItemQuery): Promise<{
    items: RowDataPacket[];
    total: number;
    page: number;
    pageSize: number;
}>;
export declare function getItem(orgId: number, canSeePrice: boolean, id: number): Promise<RowDataPacket | undefined>;
export declare function createItem(orgId: number, canSeePrice: boolean, input: ItemInput): Promise<RowDataPacket | undefined>;
export declare function updateItem(orgId: number, canSeePrice: boolean, id: number, input: ItemInput): Promise<RowDataPacket | undefined>;
export declare function setItemActive(orgId: number, id: number, isActive: boolean): Promise<{
    id: number;
    isActive: boolean;
}>;
//# sourceMappingURL=catalog.service.d.ts.map