import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { usersApi } from "../api/users";
import type { Role, TeamUser } from "../api/users";
import Field from "../components/Field";

export default function Team() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const [u, r] = await Promise.all([usersApi.list(), usersApi.roles()]);
    setUsers(u);
    setRoles(r);
  }

  useEffect(() => {
    load().catch((e: Error) => setError(e.message));
  }, []);

  async function onInvite(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLink("");
    if (!email || !roleId) {
      setError("Enter an email and choose a role");
      return;
    }
    setBusy(true);
    try {
      const res = await usersApi.invite({ email, roleId: Number(roleId) });
      setLink(res.inviteLink);
      setEmail("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className="page-title">Team</h1>
      <p className="page-sub">Invite people and see who is in your business.</p>

      <section className="panel">
        <h2>Invite someone</h2>
        <form className="auth__form" onSubmit={onInvite}>
          {error && <p className="form-alert" role="alert">{error}</p>}
          <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="field">
            <label className="field__label" htmlFor="role">Role</label>
            <select id="role" className="field__input" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
              <option value="">Choose a role</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <button className="btn btn--primary" disabled={busy}>{busy ? "Creating..." : "Create invitation"}</button>
        </form>

        {link && (
          <div className="field" style={{ marginTop: 16 }}>
            <label className="field__label" htmlFor="link">Invite link (send this to the person)</label>
            <input id="link" className="field__input" readOnly value={link} onFocus={(e) => e.target.select()} />
            <button type="button" className="btn btn--ghost" onClick={() => navigator.clipboard.writeText(link)}>Copy link</button>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>People ({users.length})</h2>
        <dl className="access">
          {users.map((u) => (
            <div className="access__row" key={u.id}>
              <dt>{u.name}<br /><small>{u.email}</small></dt>
              <dd>
                <span className="tag">{u.role}</span>
                {!u.is_active && <span className="tag">inactive</span>}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}