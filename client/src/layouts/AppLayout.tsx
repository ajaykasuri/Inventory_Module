import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import { NAV } from "../config/app";
import { logout } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

export default function AppLayout() {
  const profile = useAppSelector((s) => s.auth.profile);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]); // close the drawer after navigating
  if (!profile) return null;

  // The menu shows only what this person's role allows.
  const items = NAV.filter((n) => !n.permission || profile.permissions.includes(n.permission));
  const initials = profile.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const onLogout = async () => {
    await dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <div className="shell" data-open={open}>
      <aside className="side" aria-label="Sidebar">
        <div className="side__top"><Logo to="/app" /></div>
        <nav className="side__nav" aria-label="App">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `side__link${isActive ? " active" : ""}`}>
              <Icon size={19} aria-hidden="true" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="side__user">
          <span className="avatar" aria-hidden="true">{initials}</span>
          <div className="side__who"><strong>{profile.name}</strong><small>{profile.roleName}</small></div>
          <button type="button" className="icon-btn" onClick={onLogout} aria-label="Log out" title="Log out"><LogOut size={18} /></button>
        </div>
      </aside>
      <div className="scrim" onClick={() => setOpen(false)} />
      <div className="main">
        <header className="topbar">
          <button type="button" className="icon-btn topbar__burger" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <span className="topbar__spacer" />
          <ThemeToggle />
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
