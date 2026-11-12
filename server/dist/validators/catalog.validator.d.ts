import { z } from "zod";
export declare const unitSchema: z.ZodObject<{
    name: z.ZodString;
    abbreviation: z.ZodString;
}, z.core.$strip>;
export declare const categorySchema: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
export declare const itemSchema: z.ZodObject<{
    sku: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    categoryId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    unitId: z.ZodNumber;
    trackingType: z.ZodDefault<z.ZodEnum<{
        batch: "batch";
        none: "none";
        serial: "serial";
    }>>;
    barcode: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | null, string | null | undefined>>;
    costPrice: z.ZodDefault<z.ZodNumber>;
    sellingPrice: z.ZodDefault<z.ZodNumber>;
    taxRate: z.ZodDefault<z.ZodNumber>;
    reorderLevel: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type ItemInput = z.infer<typeof itemSchema>;
export declare const itemQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    active: z.ZodDefault<z.ZodEnum<{
        active: "active";
        all: "all";
        inactive: "inactive";
    }>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    pageSize: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type ItemQuery = z.infer<typeof itemQuerySchema>;
export declare const activeSchema: z.ZodObject<{
    isActive: z.ZodBoolean;
}, z.core.$strip>;
export declare const idSchema: z.ZodCoercedNumber<unknown>;
//# sourceMappingURL=catalog.validator.d.ts.map