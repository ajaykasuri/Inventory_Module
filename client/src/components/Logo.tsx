import { Link } from "react-router-dom";
import { APP_NAME } from "../config/app";

export default function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="logo" aria-label={`${APP_NAME} home`}>
      <svg className="logo__mark" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" />
        <rect className="bar" x="7" y="8" width="18" height="3.5" rx="1.75" />
        <rect className="bar" x="7" y="14.25" width="12" height="3.5" rx="1.75" />
        <rect className="bar bar--tape" x="7" y="20.5" width="15" height="3.5" rx="1.75" />
      </svg>
      <span>{APP_NAME}</span>
    </Link>
  );
}
