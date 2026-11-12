import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { catalogApi } from "../api/catalog";
import type { Category, Unit } from "../api/catalog";
import Field from "../components/Field";
import { useAppSelector } from "../store/hooks";

// Every field is a string in the form. Numbers are converted when we submit.
const amount = (max?: number) =>
  z.string().refine(
    (v) => v.trim() === "" || (Number(v) >= 0 && (max === undefined || Number(v) <= max)),
    max ? `Enter a number from 0 to ${max}` : "Enter a number, 0 or more",
  );

const schema = z.object({
  sku: z.string().trim().min(1, "Enter a SKU").max(60),
  name: z.string().trim().min(1, "Enter a name").max(190),
  description: z.string().max(2000),
  categoryId: z.string(),
  unitId: z.string().min(1, "Choose a unit"),
  trackingType: z.enum(["none", "batch", "serial"]),
  barcode: z.string().max(80),
  costPrice: amount(),
  sellingPrice: amount(),
  taxRate: amount(100),
  reorderLevel: amount(),
});
type Values = z.infer<typeof schema>;

const EMPTY: Values = {
  sku: "", name: "", description: "", categoryId: "", unitId: "", trackingType: "none",
  barcode: "", costPrice: "0", sellingPrice: "0", taxRate: "0", reorderLevel: "0",
};
const num = (s: string) => (s.trim() === "" ? 0 : Number(s));

export default function ItemForm() {
  const { id } = useParams(); // present when editing
  const navigate = useNavigate();
  const canSeePrice = useAppSelector((s) => s.auth.profile?.permissions.includes("item.price.view"));

  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [initial, setInitial] = useState<Values | undefined>();
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
    values: initial, // when this changes, the form is filled with it
  });

  useEffect(() => {
    Promise.all([catalogApi.units(), catalogApi.categories(), id ? catalogApi.item(Number(id)) : null])
      .then(([u, c, item]) => {
        setUnits(u);
        setCategories(c);
        if (item) {
          setInitial({
            sku: item.sku, name: item.name, description: item.description ?? "",
            categoryId: item.category_id ? String(item.category_id) : "", unitId: String(item.unit_id),
            trackingType: item.tracking_type, barcode: item.barcode ?? "",
            costPrice: String(Number(item.cost_price ?? 0)), sellingPrice: String(Number(item.selling_price ?? 0)),
            taxRate: String(Number(item.tax_rate)), reorderLevel: String(Number(item.reorder_level)),
          });
        }
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  const onSubmit = async (v: Values) => {
    setError("");
    const body = {
      sku: v.sku, name: v.name,
      description: v.description.trim() || null,
      categoryId: v.categoryId ? Number(v.categoryId) : null,
      unitId: Number(v.unitId),
      trackingType: v.trackingType,
      barcode: v.barcode.trim() || null,
      costPrice: num(v.costPrice), sellingPrice: num(v.sellingPrice),
      taxRate: num(v.taxRate), reorderLevel: num(v.reorderLevel),
    };
    try {
      if (id) await catalogApi.updateItem(Number(id), body);
      else await catalogApi.createItem(body);
      navigate("/app/items");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <>
      <h1 className="page-title">{id ? "Edit item" : "Add item"}</h1>
      <section className="panel" style={{ maxWidth: 560 }}>
        <form className="auth__form" style={{ marginTop: 0 }} onSubmit={handleSubmit(onSubmit)} noValidate>
          {error && <p className="form-alert" role="alert">{error}</p>}
          <Field label="SKU" error={errors.sku?.message} {...register("sku")} />
          <Field label="Name" error={errors.name?.message} {...register("name")} />
          <Field label="Description" error={errors.description?.message} {...register("description")} />

          <div className="field">
            <label className="field__label" htmlFor="unit">Unit</label>
            <select id="unit" className="field__input" {...register("unitId")}>
              <option value="">Choose a unit</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>)}
            </select>
            {errors.unitId && <p className="field__error">{errors.unitId.message}</p>}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="cat">Category</label>
            <select id="cat" className="field__input" {...register("categoryId")}>
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="track">Tracking</label>
            <select id="track" className="field__input" {...register("trackingType")}>
              <option value="none">None</option>
              <option value="batch">By batch (with expiry)</option>
              <option value="serial">By serial number</option>
            </select>
          </div>

          <Field label="Barcode (optional)" error={errors.barcode?.message} {...register("barcode")} />
          {canSeePrice && (
            <>
              <Field label="Cost price" type="number" step="0.01" error={errors.costPrice?.message} {...register("costPrice")} />
              <Field label="Selling price" type="number" step="0.01" error={errors.sellingPrice?.message} {...register("sellingPrice")} />
            </>
          )}
          <Field label="Tax rate (%)" type="number" step="0.01" error={errors.taxRate?.message} {...register("taxRate")} />
          <Field label="Reorder level" type="number" step="0.001" hint="Alert when stock falls to this quantity." error={errors.reorderLevel?.message} {...register("reorderLevel")} />

          <div className="row-actions">
            <button className="btn btn--primary" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save item"}</button>
            <Link to="/app/items" className="btn btn--ghost">Cancel</Link>
          </div>
        </form>
      </section>
    </>
  );
}