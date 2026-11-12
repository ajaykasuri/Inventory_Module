import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { catalogApi } from "../api/catalog";
import type { Category, Item, ItemList } from "../api/catalog";
import { useAppSelector } from "../store/hooks";

export default function Items() {
  const perms = useAppSelector((s) => s.auth.profile?.permissions ?? []);
  const canManage = perms.includes("item.manage");
  const canSeePrice = perms.includes("item.price.view");

  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<ItemList | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(""); // what is typed in the search box
  const [filters, setFilters] = useState({ search: "", categoryId: "", active: "active", page: 1 });

  useEffect(() => {
    catalogApi.categories().then(setCategories).catch((e: Error) => setError(e.message));
  }, []);

  // Reload whenever the filters change.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    catalogApi
      .items(filters)
      .then((r) => { if (!cancelled) { setData(r); setError(""); } })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filters]);

  // Changing any filter goes back to page 1, unless the change is the page itself.
  const change = (patch: Partial<typeof filters>) => setFilters((f) => ({ ...f, page: 1, ...patch }));

  const onSearch = (e: FormEvent) => { e.preventDefault(); change({ search: draft }); };

  async function toggleActive(item: Item) {
    try {
      await catalogApi.setActive(item.id, !item.is_active);
      setFilters((f) => ({ ...f })); // new object, so the list reloads
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <>
      <h1 className="page-title">Items</h1>
      <p className="page-sub">Your products and materials.</p>

      <div className="toolbar">
        <form onSubmit={onSearch} className="toolbar">
          <div className="field">
            <label className="field__label" htmlFor="q">Search</label>
            <input id="q" className="field__input" placeholder="Name, SKU or barcode" value={draft} onChange={(e) => setDraft(e.target.value)} />
          </div>
          <button className="btn btn--ghost">Search</button>
        </form>
        <div className="field">
          <label className="field__label" htmlFor="cat">Category</label>
          <select id="cat" className="field__input" value={filters.categoryId} onChange={(e) => change({ categoryId: e.target.value })}>
            <option value="">All</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="act">Show</label>
          <select id="act" className="field__input" value={filters.active} onChange={(e) => change({ active: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </select>
        </div>
        {canManage && <Link to="/app/items/new" className="btn btn--primary">Add item</Link>}
      </div>

      {error && <p className="form-alert" role="alert" style={{ marginTop: 16 }}>{error}</p>}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th><th>Name</th><th>Category</th><th>Unit</th><th>Tracking</th><th>Reorder at</th>
              {canSeePrice && <><th>Cost</th><th>Selling</th></>}
              <th>Status</th>{canManage && <th></th>}
            </tr>
          </thead>
          <tbody>
            {data?.items.map((i) => (
              <tr key={i.id}>
                <td>{i.sku}</td>
                <td>{i.name}</td>
                <td>{i.category ?? "-"}</td>
                <td>{i.unit}</td>
                <td>{i.tracking_type}</td>
                <td>{Number(i.reorder_level)}</td>
                {canSeePrice && <><td>{Number(i.cost_price).toFixed(2)}</td><td>{Number(i.selling_price).toFixed(2)}</td></>}
                <td>{i.is_active ? "Active" : "Inactive"}</td>
                {canManage && (
                  <td className="row-actions">
                    <Link to={`/app/items/${i.id}/edit`}>Edit</Link>
                    <button className="link-btn" onClick={() => toggleActive(i)}>{i.is_active ? "Deactivate" : "Reactivate"}</button>
                  </td>
                )}
              </tr>
            ))}
            {!loading && data?.items.length === 0 && (
              <tr><td colSpan={10}>No items found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="toolbar">
          <button className="btn btn--ghost" disabled={filters.page <= 1} onClick={() => change({ page: filters.page - 1 })}>Previous</button>
          <span>Page {filters.page} of {totalPages} ({data.total} items)</span>
          <button className="btn btn--ghost" disabled={filters.page >= totalPages} onClick={() => change({ page: filters.page + 1 })}>Next</button>
        </div>
      )}
    </>
  );
}