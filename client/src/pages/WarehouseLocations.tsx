import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { warehousesApi } from "../api/warehouses";
import type { Location, Warehouse } from "../api/warehouses";
import Field from "../components/Field";
import { useAppSelector } from "../store/hooks";

export default function WarehouseLocations() {
  const warehouseId = Number(useParams().id);
  const canManage = useAppSelector((s) => s.auth.profile?.permissions.includes("warehouse.manage"));
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [form, setForm] = useState({ type: "zone", code: "", parentId: "", description: "" });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [w, l] = await Promise.all([warehousesApi.get(warehouseId), warehousesApi.locations(warehouseId)]);
    setWarehouse(w);
    setLocations(l);
  }, [warehouseId]);

  useEffect(() => { load().catch((e: Error) => setError(e.message)); }, [load]);

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await warehousesApi.createLocation(warehouseId, {
        type: form.type, code: form.code,
        description: form.description || null,
        parentId: form.parentId ? Number(form.parentId) : null,
      });
      setForm((f) => ({ ...f, code: "", description: "" }));
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function onEdit(l: Location) {
    const code = window.prompt("Code", l.code); // plain and temporary
    if (!code) return;
    const description = window.prompt("Description (optional)", l.description ?? "") ?? "";
    try {
      await warehousesApi.updateLocation(l.id, { code, description: description || null });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function toggle(l: Location) {
    try {
      await warehousesApi.setLocationActive(l.id, !l.is_active);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <>
      <p><Link to="/app/warehouses">Back to warehouses</Link></p>
      <h1 className="page-title">{warehouse ? `${warehouse.name} (${warehouse.code})` : "Warehouse"}</h1>
      <p className="page-sub">Zones, racks, shelves and bins inside this warehouse.</p>
      {error && <p className="form-alert" role="alert" style={{ marginTop: 16 }}>{error}</p>}

      {canManage && (
        <section className="panel" style={{ maxWidth: 560 }}>
          <h2>Add a location</h2>
          <form className="auth__form" onSubmit={onAdd}>
            <div className="field">
              <label className="field__label" htmlFor="type">Type</label>
              <select id="type" className="field__input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="zone">Zone</option>
                <option value="rack">Rack</option>
                <option value="shelf">Shelf</option>
                <option value="bin">Bin</option>
              </select>
            </div>
            <Field label="Code" hint="Unique in this warehouse, for example A-01-03." value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <div className="field">
              <label className="field__label" htmlFor="parent">Inside (optional)</label>
              <select id="parent" className="field__input" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
                <option value="">Nothing, top level</option>
                {locations.filter((l) => l.is_active).map((l) => <option key={l.id} value={l.id}>{l.code} ({l.type})</option>)}
              </select>
            </div>
            <Field label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button className="btn btn--primary" disabled={!form.code.trim()}>Add location</button>
          </form>
        </section>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Code</th><th>Type</th><th>Inside</th><th>Description</th><th>Status</th>{canManage && <th></th>}</tr></thead>
          <tbody>
            {locations.map((l) => (
              <tr key={l.id}>
                <td>{l.code}</td><td>{l.type}</td><td>{l.parent_code ?? "-"}</td>
                <td>{l.description ?? "-"}</td><td>{l.is_active ? "Active" : "Inactive"}</td>
                {canManage && (
                  <td className="row-actions">
                    <button className="link-btn" onClick={() => onEdit(l)}>Edit</button>
                    <button className="link-btn" onClick={() => toggle(l)}>{l.is_active ? "Deactivate" : "Reactivate"}</button>
                  </td>
                )}
              </tr>
            ))}
            {locations.length === 0 && <tr><td colSpan={6}>No locations yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}