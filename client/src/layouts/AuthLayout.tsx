import type { ReactNode } from "react";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";

interface Props { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }

export default function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <div className="auth">
      <div className="auth__main">
        <div className="auth__bar"><Logo /><ThemeToggle /></div>
        <div className="auth__center">
          <h1 className="auth__title">{title}</h1>
          {subtitle && <p className="auth__sub">{subtitle}</p>}
          {children}
          {footer && <p className="auth__switch">{footer}</p>}
        </div>
      </div>
      <aside className="auth__aside" aria-hidden="true">
        <p className="auth__quote">Every change has a name and a reason.</p>
        <ul className="auth__lines">
          <li><span>Goods received</span><strong>+100</strong></li>
          <li className="out"><span>Issued to customer</span><strong>&minus;30</strong></li>
          <li className="out"><span>Adjustment: damaged</span><strong>&minus;2</strong></li>
        </ul>
      </aside>
    </div>
  );
}
