import { api } from "./http";

export interface Warehouse {
  id: number; code: string; name: string; address: string | null;
  contact_person: string | null; phone: string | null; is_active: number;
  location_count?: number;
}
export interface Location {
  id: number; type: "zone" | "rack" | "shelf" | "bin"; code: string;
  description: string | null; parent_id: number | null; parent_code: string | null; is_active: number;
}
export interface WarehouseInput {
  code: string; name: string; address: string | null; contactPerson: string | null; phone: string | null;
}

export const warehousesApi = {
  list: (active: string) => api<Warehouse[]>(`/warehouses?active=${active}`),
  get: (id: number) => api<Warehouse>(`/warehouses/${id}`),
  create: (body: WarehouseInput) => api<Warehouse>("/warehouses", { method: "POST", body }),
  update: (id: number, body: WarehouseInput) => api<Warehouse>(`/warehouses/${id}`, { method: "PUT", body }),
  setActive: (id: number, isActive: boolean) =>
    api<{ id: number; isActive: boolean }>(`/warehouses/${id}/active`, { method: "PATCH", body: { isActive } }),

  locations: (warehouseId: number) => api<Location[]>(`/warehouses/${warehouseId}/locations`),
  createLocation: (warehouseId: number, body: { type: string; code: string; description: string | null; parentId: number | null }) =>
    api<Location>(`/warehouses/${warehouseId}/locations`, { method: "POST", body }),
  updateLocation: (id: number, body: { code: string; description: string | null }) =>
    api<Location>(`/locations/${id}`, { method: "PUT", body }),
  setLocationActive: (id: number, isActive: boolean) =>
    api<{ id: number; isActive: boolean }>(`/locations/${id}/active`, { method: "PATCH", body: { isActive } }),
};