import type { NavItem } from "../config/app";

// Placeholder for screens we have not built yet. It is replaced one by one.
export default function ComingSoon({ item }: { item: NavItem }) {
  return (
    <div className="empty" style={{ marginInline: 0 }}>
      <h1>{item.label}</h1>
      <p>{item.blurb}</p>
      <p>This screen is not built yet. It arrives in a later checkpoint.</p>
    </div>
  );
}
