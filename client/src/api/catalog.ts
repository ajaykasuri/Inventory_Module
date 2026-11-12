import { api } from "./http";

export interface Unit { id: number; name: string; abbreviation: string }
export interface Category { id: number; name: string; item_count?: number }

export interface Item {
  id: number; sku: string; name: string; description: string | null;
  category_id: number | null; category: string | null;
  unit_id: number; unit_name: string; unit: string;
  tracking_type: "none" | "batch" | "serial"; barcode: string | null;
  tax_rate: string; reorder_level: string; is_active: number;
  cost_price?: string; selling_price?: string; // missing when you may not see prices
}
export interface ItemList { items: Item[]; total: number; page: number; pageSize: number }

export interface ItemInput {
  sku: string; name: string; description: string | null;
  categoryId: number | null; unitId: number;
  trackingType: "none" | "batch" | "serial"; barcode: string | null;
  costPrice: number; sellingPrice: number; taxRate: number; reorderLevel: number;
}

export const catalogApi = {
  units: () => api<Unit[]>("/units"),
  categories: () => api<Category[]>("/categories"),
  createCategory: (name: string) => api<Category>("/categories", { method: "POST", body: { name } }),
  renameCategory: (id: number, name: string) => api<Category>(`/categories/${id}`, { method: "PUT", body: { name } }),
  deleteCategory: (id: number) => api<void>(`/categories/${id}`, { method: "DELETE" }),

  items: (params: Record<string, string | number>) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== "") qs.set(key, String(value)); // skip empty filters
    }
    return api<ItemList>(`/items?${qs}`);
  },
  item: (id: number) => api<Item>(`/items/${id}`),
  createItem: (body: ItemInput) => api<Item>("/items", { method: "POST", body }),
  updateItem: (id: number, body: ItemInput) => api<Item>(`/items/${id}`, { method: "PUT", body }),
  setActive: (id: number, isActive: boolean) =>
    api<{ id: number; isActive: boolean }>(`/items/${id}/active`, { method: "PATCH", body: { isActive } }),
};