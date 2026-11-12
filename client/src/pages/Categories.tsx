import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { catalogApi } from "../api/catalog";
import type { Category } from "../api/catalog";
import Field from "../components/Field";
import { useAppSelector } from "../store/hooks";

export default function Categories() {
  const canManage = useAppSelector((s) => s.auth.profile?.permissions.includes("item.manage"));
  const [list, setList] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const load = () => catalogApi.categories().then(setList).catch((e: Error) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await catalogApi.createCategory(name);
      setName("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function onRename(c: Category) {
    const next = window.prompt("New name", c.name); // plain and temporary
    if (!next || next === c.name) return;
    setError("");
    try {
      await catalogApi.renameCategory(c.id, next);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function onDelete(c: Category) {
    if (!window.confirm(`Delete "${c.name}"? Categories assigned to items cannot be deleted.`)) return;
    setError("");
    try {
      await catalogApi.deleteCategory(c.id);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <>
      <h1 className="page-title">Categories</h1>
      <p className="page-sub">Group your items.</p>
      {error && <p className="form-alert" role="alert" style={{ marginTop: 16 }}>{error}</p>}

      {canManage && (
        <section className="panel">
          <form className="toolbar" style={{ marginTop: 0 }} onSubmit={onAdd}>
            <Field label="New category" value={name} onChange={(e) => setName(e.target.value)} />
            <button className="btn btn--primary" disabled={!name.trim()}>Add</button>
          </form>
        </section>
      )}

      <section className="panel">
        <dl className="access">
          {list.map((c) => (
            <div className="access__row" key={c.id}>
              <dt>{c.name}</dt>
              <dd>
                <span className="tag">{c.item_count} active items</span>
                {canManage && <button className="link-btn" onClick={() => onRename(c)}>Rename</button>}
                {canManage && <button className="link-btn" onClick={() => onDelete(c)}>Delete</button>}
              </dd>
            </div>
          ))}
          {list.length === 0 && <p>No categories yet.</p>}
        </dl>
      </section>
    </>
  );
}