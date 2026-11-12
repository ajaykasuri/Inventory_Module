export const OWNER_ROLE = "Owner / Admin";
export const ROLE_PERMISSIONS = {
    [OWNER_ROLE]: "ALL",
    "Inventory Manager": [
        "item.view", "item.manage", "item.price.view", "warehouse.view", "warehouse.manage",
        "supplier.view", "po.view", "po.approve", "receipt.view", "stock.view", "stock.issue",
        "stock.transfer", "stock.adjust.request", "stock.adjust.approve", "count.view",
        "count.manage", "count.perform", "report.stock", "report.valuation", "audit.view",
    ],
    "Purchase Officer": [
        "item.view", "item.price.view", "warehouse.view", "supplier.view", "supplier.manage",
        "po.view", "po.create", "receipt.view", "stock.view", "report.stock",
    ],
    "Warehouse Staff": [
        "item.view", "warehouse.view", "po.view", "receipt.view", "receipt.create", "stock.view",
        "stock.issue", "stock.transfer", "stock.adjust.request", "count.view", "count.perform",
        "report.stock",
    ],
    Auditor: [
        "item.view", "item.price.view", "warehouse.view", "supplier.view", "po.view",
        "receipt.view", "stock.view", "count.view", "report.stock", "report.valuation", "audit.view",
    ],
};
//# sourceMappingURL=roles.js.map