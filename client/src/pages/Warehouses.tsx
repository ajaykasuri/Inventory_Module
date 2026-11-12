import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import { warehousesApi } from "../api/warehouses";
import type { Warehouse } from "../api/warehouses";
import Field from "../components/Field";
import { useAppSelector } from "../store/hooks";

const EMPTY = { code: "", name: "", address: "", contactPerson: "", phone: "" };

export default function Warehouses() {
  const canManage = useAppSelector((s) => s.auth.profile?.permissions.includes("warehouse.manage"));
  const [list, setList] = useState<Warehouse[]>([]);
  const [show, setShow] = useState("active");
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");

  const load = useCallback(
    () => warehousesApi.list(show).then(setList).catch((e: Error) => setError(e.message)),
    [show],
  );
  useEffect(() => { load(); }, [load]);

  const bind = (key: keyof typeof EMPTY) => ({
    value: form[key],
    onChange: (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  function startAdd() {
    setForm(EMPTY); setEditingId(null); setError(""); setNameError(""); setOpen(true);
  }
  function startEdit(w: Warehouse) {
    setForm({ code: w.code, name: w.name, address: w.address ?? "", contactPerson: w.contact_person ?? "", phone: w.phone ?? "" });
    setEditingId(w.id); setError(""); setNameError(""); setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setNameError("Name is required");
      return;
    }
    setNameError("");
    const body = {
      code: form.code, name: form.name,
      address: form.address || null, contactPerson: form.contactPerson || null, phone: form.phone || null,
    };
    try {
      if (editingId) await warehousesApi.update(editingId, body);
      else await warehousesApi.create(body);
      setOpen(false);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function toggle(w: Warehouse) {
    try {
      await warehousesApi.setActive(w.id, !w.is_active);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <>
      <h1 className="page-title">Warehouses</h1>
      <p className="page-sub">The places where you keep stock.</p>

      <div className="toolbar">
        <div className="field">
          <label className="field__label" htmlFor="show">Show</label>
          <select id="show" className="field__input" value={show} onChange={(e) => setShow(e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </select>
        </div>
        {canManage && <button className="btn btn--primary" onClick={startAdd}>Add warehouse</button>}
      </div>

      {error && <p className="form-alert" role="alert" style={{ marginTop: 16 }}>{error}</p>}

      {open && (
        <section className="panel" style={{ maxWidth: 560 }}>
          <h2>{editingId ? "Edit warehouse" : "Add warehouse"}</h2>
          <form className="auth__form" onSubmit={onSubmit}>
            <Field label="Code" hint="Short and unique, for example MAIN." {...bind("code")} />
            <Field
              label="Name"
              error={nameError}
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                if (nameError) setNameError("");
              }}
            />
            <Field label="Address (optional)" {...bind("address")} />
            <Field label="Contact person (optional)" {...bind("contactPerson")} />
            <Field label="Phone (optional)" {...bind("phone")} />
            <div className="row-actions">
              <button className="btn btn--primary">Save</button>
              <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </form>
        </section>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Code</th><th>Name</th><th>Contact</th><th>Locations</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((w) => (
              <tr key={w.id}>
                <td>{w.code}</td>
                <td>{w.name}</td>
                <td>{[w.contact_person, w.phone].filter(Boolean).join(", ") || "-"}</td>
                <td>{w.location_count}</td>
                <td>{w.is_active ? "Active" : "Inactive"}</td>
                <td className="row-actions">
                  <Link to={`/app/warehouses/${w.id}`}>Locations</Link>
                  {canManage && <button className="link-btn" onClick={() => startEdit(w)}>Edit</button>}
                  {canManage && <button className="link-btn" onClick={() => toggle(w)}>{w.is_active ? "Deactivate" : "Reactivate"}</button>}
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={6}>No warehouses found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}