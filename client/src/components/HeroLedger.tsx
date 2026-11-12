import { useEffect, useState } from "react";
import { CircleCheck, RotateCcw, TriangleAlert } from "lucide-react";
import { useCountTo } from "../hooks/useCountTo";

type Kind = "in" | "out" | "adj";
interface Row { kind: Kind; label: string; detail: string; qty: number }

// A short story about one item: bags come in, go out, get damaged, get restocked.
const ROWS: Row[] = [
  { kind: "in", label: "Goods received", detail: "PO-0012, Sita", qty: 100 },
  { kind: "out", label: "Issued to customer", detail: "Order 4471, Ravi", qty: -30 },
  { kind: "out", label: "Transfer to Shop 2", detail: "Sita", qty: -20 },
  { kind: "adj", label: "Adjustment: damaged", detail: "2 torn bags, Sita", qty: -2 },
  { kind: "in", label: "Goods received", detail: "PO-0013, Sita", qty: 60 },
];
const REORDER = 50;
const BALANCES = ROWS.reduce<number[]>((acc, r) => [...acc, (acc.length ? acc[acc.length - 1] : 0) + r.qty], []);
const SIGN: Record<Kind, string> = { in: "+", out: "\u2212", adj: "\u00B1" };
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fmt = (n: number) => (n > 0 ? `+${n}` : `\u2212${Math.abs(n)}`);

export default function HeroLedger() {
  const [step, setStep] = useState(() => (reduced() ? ROWS.length : 0));
  const [run, setRun] = useState(0);

  // Posts one row at a time. "run" changes when the visitor presses Replay.
  useEffect(() => {
    if (reduced()) { setStep(ROWS.length); return; }
    setStep(0);
    const timers = ROWS.map((_, i) => window.setTimeout(() => setStep(i + 1), 900 + i * 1200));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [run]);

  const balance = step > 0 ? BALANCES[step - 1] : 0;
  const shown = useCountTo(balance);
  const below = step > 0 && balance < REORDER;
  const recovered = step === ROWS.length && !below;

  return (
    <div className="ledger" aria-label="Example stock ledger for one item">
      <div className="ledger__head">
        <div>
          <h2 className="ledger__item">Basmati rice, 25 kg bag</h2>
          <p className="ledger__where">Main warehouse</p>
        </div>
        <div className="ledger__total">
          <span className="ledger__number">{shown}</span>
          <span className="ledger__unit">bags</span>
        </div>
      </div>

      <div className="ledger__status" aria-live="polite">
        {below && <span className="chip chip--warn"><TriangleAlert size={14} /> Below reorder level of {REORDER}</span>}
        {recovered && <span className="chip chip--ok"><CircleCheck size={14} /> Back above reorder level</span>}
      </div>

      <div className="ledger__cols" aria-hidden="true"><span>Movement</span><span>Change</span><span>Balance</span></div>
      <ol className="ledger__rows">
        {ROWS.map((r, i) =>
          i < step ? (
            <li key={`${run}-${i}`} className={`ledger__row ledger__row--${r.kind}`}>
              <span className="ledger__sign" aria-hidden="true">{SIGN[r.kind]}</span>
              <span className="ledger__what"><strong>{r.label}</strong><small>{r.detail}</small></span>
              <span className="ledger__qty">{fmt(r.qty)}</span>
              <span className="ledger__bal">{BALANCES[i]}</span>
            </li>
          ) : (
            <li key={`ghost-${i}`} className="ledger__row ledger__row--ghost" aria-hidden="true" />
          ),
        )}
      </ol>

      <div className="ledger__foot">
        <p>The balance is the sum of every movement above. Nobody types it in.</p>
        <button type="button" className="ledger__replay" onClick={() => setRun((n) => n + 1)}>
          <RotateCcw size={14} /> Replay
        </button>
      </div>
    </div>
  );
}
