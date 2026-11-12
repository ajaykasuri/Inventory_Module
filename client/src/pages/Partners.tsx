import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { partnersApi } from "../api/partners";
import type { Partner, PartnerList } from "../api/partners";
import Field from "../components/Field";
import { useAppSelector } from "../store/hooks";

const EMPTY = { name: "", contactPerson: "", email: "", phone: "", address: "", taxId: "", paymentTermsDays: "0", notes: "" };
const TITLES = { supplier: "Suppliers", customer: "Customers" } as const;

export default function Partners({ kind }: { kind: "supplier" | "customer" }) {
  const canManage = useAppSelector((s) => s.auth.profile?.permissions.includes("supplier.manage"));
  const api = useMemo(() => partnersApi(kind), [kind]);

  const [data, setData] = useState<PartnerList | null>(null);
  const [draft, setDraft] = useState("");
  const [filters, setFilters] = useState({ search: "", active: "active", page: 1 });
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    () => api.list(filters).then(setData).catch((e: Error) => setError(e.message)),
    [api, filters],
  );
  useEffect(() => { load(); }, [load]);

  const bind = (key: keyof typeof EMPTY) => ({
    value: form[key],
    onChange: (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  function startAdd() { setForm(EMPTY); setEditingId(null); setError(""); setOpen(true); }
  function startEdit(p: Partner) {
    setForm({
      name: p.name, contactPerson: p.contact_person ?? "", email: p.email ?? "", phone: p.phone ?? "",
      address: p.address ?? "", taxId: p.tax_id ?? "", paymentTermsDays: String(p.payment_terms_days), notes: p.notes ?? "",
    });
    setEditingId(p.id); setError(""); setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const body = {
      name: form.name,
      contactPerson: form.contactPerson || null, email: form.email || null, phone: form.phone || null,
      address: form.address || null, taxId: form.taxId || null,
      paymentTermsDays: Number(form.paymentTermsDays) || 0, notes: form.notes || null,
    };
    try {
      if (editingId) await api.update(editingId, body);
      else await api.create(body);
      setOpen(false);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function toggle(p: Partner) {
    try {
      await api.setActive(p.id, !p.is_active);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const change = (patch: Partial<typeof filters>) => setFilters((f) => ({ ...f, page: 1, ...patch }));

  return (
    <>
      <h1 className="page-title">{TITLES[kind]}</h1>
      <p className="page-sub">{kind === "supplier" ? "Who you buy from." : "Who you sell to."}</p>

      <div className="toolbar">
        <form className="toolbar" style={{ marginTop: 0 }} onSubmit={(e) => { e.preventDefault(); change({ search: draft }); }}>
          <div className="field">
            <label className="field__label" htmlFor="q">Search</label>
            <input id="q" className="field__input" placeholder="Name, contact, phone or email" value={draft} onChange={(e) => setDraft(e.target.value)} />
          </div>
          <button className="btn btn--ghost">Search</button>
        </form>
        <div className="field">
          <label className="field__label" htmlFor="show">Show</label>
          <select id="show" className="field__input" value={filters.active} onChange={(e) => change({ active: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </select>
        </div>
        {canManage && <button className="btn btn--primary" onClick={startAdd}>Add {kind}</button>}
      </div>

      {error && <p className="form-alert" role="alert" style={{ marginTop: 16 }}>{error}</p>}

      {open && (
        <section className="panel" style={{ maxWidth: 560 }}>
          <h2>{editingId ? `Edit ${kind}` : `Add ${kind}`}</h2>
          <form className="auth__form" onSubmit={onSubmit}>
            <Field label="Name" {...bind("name")} />
            <Field label="Contact person (optional)" {...bind("contactPerson")} />
            <Field label="Email (optional)" type="email" {...bind("email")} />
            <Field label="Phone (optional)" {...bind("phone")} />
            <Field label="Address (optional)" {...bind("address")} />
            <Field label="GSTIN or tax ID (optional)" {...bind("taxId")} />
            <Field label="Payment terms (days)" type="number" min="0" max="365" {...bind("paymentTermsDays")} />
            <Field label="Notes (optional)" {...bind("notes")} />
            <div className="row-actions">
              <button className="btn btn--primary" disabled={!form.name.trim()}>Save</button>
              <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </form>
        </section>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Contact</th><th>Phone</th><th>Email</th><th>Terms</th><th>Status</th>{canManage && <th></th>}</tr></thead>
          <tbody>
            {data?.items.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td><td>{p.contact_person ?? "-"}</td><td>{p.phone ?? "-"}</td><td>{p.email ?? "-"}</td>
                <td>{p.payment_terms_days ? `${p.payment_terms_days} days` : "-"}</td>
                <td>{p.is_active ? "Active" : "Inactive"}</td>
                {canManage && (
                  <td className="row-actions">
                    <button className="link-btn" onClick={() => startEdit(p)}>Edit</button>
                    <button className="link-btn" onClick={() => toggle(p)}>{p.is_active ? "Deactivate" : "Reactivate"}</button>
                  </td>
                )}
              </tr>
            ))}
            {data?.items.length === 0 && <tr><td colSpan={7}>Nothing found.</td></tr>}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="toolbar">
          <button className="btn btn--ghost" disabled={filters.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>Previous</button>
          <span>Page {filters.page} of {totalPages} ({data.total})</span>
          <button className="btn btn--ghost" disabled={filters.page >= totalPages} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>Next</button>
        </div>
      )}
    </>
  );
}