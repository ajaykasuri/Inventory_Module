import { useAppSelector } from "../store/hooks";

const GROUPS: Record<string, string> = {
  org: "Business settings", user: "Team", approval: "Approvals", item: "Items", warehouse: "Warehouses",
  supplier: "Suppliers and customers", po: "Purchase orders", receipt: "Goods receipts", stock: "Stock",
  count: "Stock counts", report: "Reports", audit: "Audit trail",
};

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function Dashboard() {
  const profile = useAppSelector((s) => s.auth.profile);
  if (!profile) return null;

  // "item.price.view" becomes group "item" with action "price.view".
  const grouped = new Map<string, string[]>();
  for (const code of profile.permissions) {
    const [group, ...rest] = code.split(".");
    grouped.set(group, [...(grouped.get(group) ?? []), rest.join(".")]);
  }

  return (
    <>
      <h1 className="page-title">{greeting()}, {profile.name.split(" ")[0]}</h1>
      <p className="page-sub">Here is your workspace.</p>

      <div className="tiles">
        <div className="tile"><small>Business</small><strong>{profile.organizationName}</strong></div>
        <div className="tile"><small>Your role</small><strong>{profile.roleName}</strong></div>
        <div className="tile"><small>Permissions</small><strong>{profile.permissions.length}</strong></div>
      </div>

      <section className="panel">
        <h2>What you can do</h2>
        <p>The menu on the left shows only the areas your role can open. These are the actions each area allows you.</p>
        <dl className="access">
          {[...grouped.entries()].map(([group, actions]) => (
            <div className="access__row" key={group}>
              <dt>{GROUPS[group] ?? group}</dt>
              <dd>{actions.map((a) => <span className="tag" key={a}>{a}</span>)}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
