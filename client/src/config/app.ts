import {
  Boxes, ChartColumn, ClipboardCheck, ClipboardList, Contact, LayoutDashboard,
  Package, ScrollText, Tags, Truck, Users, Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Change the product name here and it updates everywhere.
export const APP_NAME = "Stockline";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  permission?: string; // the menu item only shows if the user has this permission
  end?: boolean;
  blurb?: string;
}


export const NAV: NavItem[] = [
  { label: "Categories", to: "/app/categories", icon: Tags, permission: "item.view", blurb: "Group your items." },
  { label: "Dashboard", to: "/app", icon: LayoutDashboard, end: true },
  { label: "Items", to: "/app/items", icon: Package, permission: "item.view", blurb: "Products, categories, units, barcodes and reorder levels." },
  { label: "Warehouses", to: "/app/warehouses", icon: Warehouse, permission: "warehouse.view", blurb: "Warehouses, zones, racks, shelves and bins." },
  { label: "Suppliers", to: "/app/suppliers", icon: Truck, permission: "supplier.view", blurb: "Suppliers and customers in one place." },
  { label: "Customers", to: "/app/customers", icon: Contact, permission: "supplier.view", blurb: "Who you sell to." },
  { label: "Purchase orders", to: "/app/purchase-orders", icon: ClipboardList, permission: "po.view", blurb: "Orders, partial deliveries, backorders and returns." },
  { label: "Stock", to: "/app/stock", icon: Boxes, permission: "stock.view", blurb: "Current stock, movements, transfers and adjustments." },
  { label: "Stock counts", to: "/app/counts", icon: ClipboardCheck, permission: "count.view", blurb: "Count a warehouse and approve the differences." },
  { label: "Reports", to: "/app/reports", icon: ChartColumn, permission: "report.stock", blurb: "Stock, movement, expiry and valuation reports." },
  { label: "Audit trail", to: "/app/audit", icon: ScrollText, permission: "audit.view", blurb: "Who did what, and when." },
  { label: "Team", to: "/app/team", icon: Users, permission: "user.manage", blurb: "Invite people and choose their roles." },
];
