import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftRight, BellRing, CalendarClock, Check, ChevronDown, ClipboardList,
  MapPin, Menu, Minus, ShieldCheck, X,
} from "lucide-react";
import HeroLedger from "../components/HeroLedger";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import { APP_NAME } from "../config/app";
import { useAppSelector } from "../store/hooks";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#roles", label: "Roles" },
  { href: "#faq", label: "FAQ" },
];

const FEATURES = [
  { icon: MapPin, title: "Many warehouses, exact locations", text: "Split stock across warehouses, then down to zones, racks, shelves and bins, so anyone can find an item in seconds." },
  { icon: ClipboardList, title: "Purchasing that follows the goods", text: "Raise purchase orders, receive deliveries in parts, and keep the unfinished balance open as a backorder." },
  { icon: ArrowLeftRight, title: "Transfers without lost stock", text: "Moved stock shows as in transit until the receiving warehouse confirms it, and any difference is flagged." },
  { icon: CalendarClock, title: "Batches, serial numbers and expiry", text: "Trace goods back to a delivery, and let the system suggest the earliest-expiring stock first." },
  { icon: ShieldCheck, title: "Approvals and a full audit trail", text: "Choose what needs sign-off. Every action records who did it, when, and the values before and after." },
  { icon: BellRing, title: "Alerts and reports that reach people", text: "Low stock, expiring batches and overdue orders go to the right person. Reports export to Excel, CSV and PDF." },
];

const STEPS = [
  { title: "Set up your business", text: "Add your warehouses, items and suppliers, then enter opening stock. Invite your team and give each person a role." },
  { title: "Receive stock", text: "When a delivery arrives, staff record what actually came in, against the purchase order. Partial deliveries are fine." },
  { title: "Issue, transfer and correct", text: "Every issue, transfer and adjustment is saved as a movement with a reason. Mistakes are fixed with a visible correction." },
  { title: "Watch and decide", text: "Alerts tell you what is running low or about to expire. Reports show what stock you have and what it is worth." },
];

const ROLES = ["Owner / Admin", "Inventory Manager", "Purchase Officer", "Warehouse Staff", "Auditor"];
const ABILITIES: { label: string; allowed: boolean[] }[] = [
  { label: "See cost and prices", allowed: [true, true, true, false, true] },
  { label: "Create purchase orders", allowed: [true, false, true, false, false] },
  { label: "Approve purchase orders", allowed: [true, true, false, false, false] },
  { label: "Record goods received", allowed: [true, false, false, true, false] },
  { label: "Issue and transfer stock", allowed: [true, true, false, true, false] },
  { label: "Approve stock adjustments", allowed: [true, true, false, false, false] },
  { label: "View the audit trail", allowed: [true, true, false, false, true] },
];

const FAQ = [
  { q: "Can many businesses use the same system?", a: "Yes. Each business gets its own private workspace. Nobody can see another business's items, stock or people." },
  { q: "Why can't I just edit a quantity?", a: "Because an edited number leaves no trail. Here, stock changes only through movements such as receipts, issues, transfers and adjustments, and each one records who and why." },
  { q: "Can warehouse staff see prices?", a: "Not by default. Cost and valuation figures are limited to the roles that need them." },
  { q: "What if someone makes a mistake?", a: "A posted entry is never deleted. It is reversed with a correcting entry that stays in the history, so the record is always complete." },
  { q: "Does it work on a phone?", a: "The web app adapts to any screen size. A mobile app for scanning barcodes and counting stock is planned." },
];

function Nav() {
  const status = useAppSelector((s) => s.auth.status);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const loggedIn = status === "authenticated";
  return (
    <header className="nav" data-scrolled={scrolled}>
      <div className="container nav__inner">
        <Logo />
        <nav className="nav__links" aria-label="Main">
          {LINKS.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
        </nav>
        <div className="nav__actions">
          <ThemeToggle />
          {loggedIn ? (
            <Link to="/app" className="btn btn--primary">Open app</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost">Log in</Link>
              <Link to="/signup" className="btn btn--primary">Get started</Link>
            </>
          )}
          <button type="button" className="icon-btn nav__burger" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <div id="mobile-menu" className="nav__panel" hidden={!open}>
        {LINKS.map((l) => <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>)}
        {loggedIn ? (
          <Link to="/app" className="btn btn--primary">Open app</Link>
        ) : (
          <>
            <Link to="/signup" className="btn btn--primary">Get started</Link>
            <Link to="/login" className="btn btn--ghost">Log in</Link>
          </>
        )}
      </div>
    </header>
  );
}

// Fills the line and lights up each step as you scroll through the section.
function HowSteps() {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-step]"));
    let raf = 0;

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const rect = el.getBoundingClientRect();
      const p = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.65 - rect.top) / rect.height));
      el.style.setProperty("--p", String(p));
      items.forEach((item) => {
        item.dataset.on = String(reduce || item.getBoundingClientRect().top < vh * 0.65);
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <ol className="steps" ref={ref}>
      {STEPS.map((s, i) => (
        <li key={s.title} className="step" data-step data-on="false">
          <span className="step__num" aria-hidden="true">{i + 1}</span>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
        </li>
      ))}
    </ol>
  );
}

export default function Landing() {
  const status = useAppSelector((s) => s.auth.status);
  const cta = status === "authenticated" ? { to: "/app", label: "Open your workspace" } : { to: "/signup", label: "Create your workspace" };

  return (
    <>
      <Nav />
      <main>
        <section className="hero">
          <div className="container hero__grid">
            <div>
              <h1 className="hero__title">Know what you have, where it is, and how it got there.</h1>
              <p className="hero__lead">
                {APP_NAME} records every receipt, issue, transfer and correction as it happens, so your stock count always has a history behind it. Built for businesses with one warehouse or ten.
              </p>
              <div className="hero__cta">
                <Link to={cta.to} className="btn btn--primary btn--lg">{cta.label}</Link>
                <a href="#how" className="btn btn--ghost btn--lg">See how it works</a>
              </div>
              <p className="hero__note">No spreadsheets to reconcile. Each business keeps its own private data.</p>
            </div>
            <HeroLedger />
          </div>
        </section>

        <section className="section principle">
          <div className="container principle__grid">
            <div>
              <h2 className="section__title">Quantities are never edited. They are added up.</h2>
              <p className="section__lead">
                Most stock tools let anyone overwrite a number. {APP_NAME} saves each change as a movement with who, when and why, and the current quantity is simply the total of those movements.
              </p>
            </div>
            <div className="compare">
              <div className="compare__panel compare__panel--old">
                <h3>A typed number</h3>
                <p className="compare__big">48</p>
                <p className="compare__note">Changed by: unknown. Reason: none. Was it 50 yesterday?</p>
              </div>
              <div className="compare__panel compare__panel--new">
                <h3>The ledger</h3>
                <ul className="compare__list">
                  <li><span>Received</span><strong>+100</strong></li>
                  <li><span>Issued</span><strong>&minus;30</strong></li>
                  <li><span>Transferred</span><strong>&minus;20</strong></li>
                  <li><span>Damaged</span><strong>&minus;2</strong></li>
                </ul>
                <p className="compare__big">48</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="features">
          <div className="container features__grid">
            <div className="features__intro">
              <h2 className="section__title">Everything a stockroom needs, in one place.</h2>
              <p className="section__lead">From the first purchase order to the monthly report, each step feeds the same honest record.</p>
            </div>
            <ul>
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="feature">
                  <span className="feature__icon"><Icon size={22} /></span>
                  <div><h3>{title}</h3><p>{text}</p></div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section how" id="how">
          <div className="container">
            <h2 className="section__title">From first setup to daily rhythm.</h2>
            <HowSteps />
          </div>
        </section>

        <section className="section" id="roles">
          <div className="container">
            <h2 className="section__title">The right access for each person.</h2>
            <p className="section__lead">Everyone sees what their job needs and nothing more. A warehouse worker can receive goods without ever seeing a price.</p>
            <div className="roles__wrap">
              <table className="roles">
                <thead>
                  <tr><th scope="col"><span className="sr-only">Ability</span></th>{ROLES.map((r) => <th key={r} scope="col">{r}</th>)}</tr>
                </thead>
                <tbody>
                  {ABILITIES.map((a) => (
                    <tr key={a.label}>
                      <th scope="row">{a.label}</th>
                      {a.allowed.map((ok, i) => (
                        <td key={ROLES[i]}>
                          {ok ? <Check size={18} className="roles__yes" aria-hidden="true" /> : <Minus size={18} className="roles__no" aria-hidden="true" />}
                          <span className="sr-only">{ok ? "Yes" : "No"}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="section faq" id="faq" style={{ paddingTop: 0 }}>
          <div className="container">
            <h2 className="section__title">Questions people ask.</h2>
            <div className="faq__list">
              {FAQ.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}<ChevronDown size={20} aria-hidden="true" /></summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="container">
          <div className="cta">
            <h2>Start with one warehouse and a few items.</h2>
            <p>Set up your business, invite your team, and let the ledger do the remembering.</p>
            <Link to={cta.to} className="btn btn--primary btn--lg">{cta.label}</Link>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer__row">
            <Logo />
            <nav className="footer__links" aria-label="Footer">
              {LINKS.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
              <Link to="/login">Log in</Link>
            </nav>
          </div>
          <small>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</small>
        </div>
      </footer>
    </>
  );
}
