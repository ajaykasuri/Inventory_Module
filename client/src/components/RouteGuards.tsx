import type { ReactNode } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

function Splash() {
  return <div className="splash" role="status" aria-label="Loading"><span className="splash__dot" /></div>;
}

// Only logged-in users get through. Others are sent to the login page.
export function ProtectedRoute() {
  const status = useAppSelector((s) => s.auth.status);
  const location = useLocation();
  if (status === "loading") return <Splash />;
  if (status === "anonymous") return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

// Login and signup pages are for logged-out users only.
export function PublicOnlyRoute() {
  const status = useAppSelector((s) => s.auth.status);
  if (status === "loading") return <Splash />;
  if (status === "authenticated") return <Navigate to="/app" replace />;
  return <Outlet />;
}

// Hides a whole page unless the user's role has the permission.
export function RequirePermission({ code, children }: { code: string; children: ReactNode }) {
  const allowed = useAppSelector((s) => s.auth.profile?.permissions.includes(code));
  if (!allowed) {
    return (
      <div className="empty">
        <h1>You do not have access to this page</h1>
        <p>Your role does not include this permission. Ask your business owner if you need it.</p>
        <Link to="/app" className="btn btn--ghost">Back to dashboard</Link>
      </div>
    );
  }
  return <>{children}</>;
}
