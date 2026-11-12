import { api } from "./http";

export interface Partner {
  id: number; type: "supplier" | "customer"; name: string;
  contact_person: string | null; email: string | null; phone: string | null;
  address: string | null; tax_id: string | null;
  payment_terms_days: number; notes: string | null; is_active: number;
}
export interface PartnerList { items: Partner[]; total: number; page: number; pageSize: number }
export interface PartnerInput {
  name: string; contactPerson: string | null; email: string | null; phone: string | null;
  address: string | null; taxId: string | null; paymentTermsDays: number; notes: string | null;
}

// Returns the calls for one kind: /suppliers or /customers.
export function partnersApi(kind: "supplier" | "customer") {
  const base = kind === "supplier" ? "/suppliers" : "/customers";
  return {
    list: (params: { search: string; active: string; page: number }) => {
      const qs = new URLSearchParams({ active: params.active, page: String(params.page) });
      if (params.search) qs.set("search", params.search);
      return api<PartnerList>(`${base}?${qs}`);
    },
    create: (body: PartnerInput) => api<Partner>(base, { method: "POST", body }),
    update: (id: number, body: PartnerInput) => api<Partner>(`${base}/${id}`, { method: "PUT", body }),
    setActive: (id: number, isActive: boolean) =>
      api<{ id: number; isActive: boolean }>(`${base}/${id}/active`, { method: "PATCH", body: { isActive } }),
  };
}