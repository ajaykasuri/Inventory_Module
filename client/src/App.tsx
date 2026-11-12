import { Link, Route, Routes } from "react-router-dom";
import { PublicOnlyRoute, ProtectedRoute, RequirePermission } from "./components/RouteGuards";
import { NAV } from "./config/app";
import AppLayout from "./layouts/AppLayout";
import AcceptInvitation from "./pages/AcceptInvitation";
import ComingSoon from "./pages/ComingSoon";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Team from "./pages/Team";
import Items from "./pages/Items";
import ItemForm from "./pages/ItemForm";
import Categories from "./pages/Categories";
import Warehouses from "./pages/Warehouses";
import WarehouseLocations from "./pages/WarehouseLocations";
import Partners from "./pages/Partners";
function NotFound() {
  return (
    <div className="empty">
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn--primary">Go home</Link>
    </div>
  );
}

const BUILT = new Set(["/app/team", "/app/items", "/app/categories", "/app/suppliers", "/app/customers"]);


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
      <Route path="/accept-invitation" element={<AcceptInvitation />} />
      <Route path="/app" element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* 1. Main Dashboard Index Route */}
          <Route index element={<Dashboard />} />
          <Route path="team" element={<RequirePermission code="user.manage"><Team /></RequirePermission>} />
          <Route path="items" element={<RequirePermission code="item.view"><Items /></RequirePermission>} />
          <Route path="items/new" element={<RequirePermission code="item.manage"><ItemForm /></RequirePermission>} />
          <Route path="items/:id/edit" element={<RequirePermission code="item.manage"><ItemForm /></RequirePermission>} />
          <Route path="warehouses" element={<RequirePermission code="warehouse.view"><Warehouses /></RequirePermission>} />
          <Route path="warehouses/:id" element={<RequirePermission code="warehouse.view"><WarehouseLocations /></RequirePermission>} />
          <Route path="categories" element={<RequirePermission code="item.view"><Categories /></RequirePermission>} />
          <Route path="suppliers" element={<RequirePermission code="supplier.view"><Partners kind="supplier" /></RequirePermission>} />
          <Route path="customers" element={<RequirePermission code="supplier.view"><Partners kind="customer" /></RequirePermission>} />
          {NAV.map((item) =>
            item.permission && !BUILT.has(item.to) ? (
              <Route
                key={item.to}
                path={item.to.replace("/app/", "")}
                element={<RequirePermission code={item.permission}><ComingSoon item={item} /></RequirePermission>}
              />
            ) : null,
          )}
        </Route>
      </Route>



      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
