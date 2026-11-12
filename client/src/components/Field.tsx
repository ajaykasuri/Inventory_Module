import { useId, useState } from "react";
import type { ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FieldProps extends ComponentProps<"input"> {
  label: string;
  error?: string;
  hint?: string;
}

// A labelled input with an error message. Password fields get a show/hide button.
export default function Field({ label, error, hint, type = "text", ...input }: FieldProps) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>{label}</label>
      <div className="field__control">
        <input
          {...input}
          id={id}
          type={isPassword && shown ? "text" : type}
          className={`field__input${isPassword ? " field__input--has-action" : ""}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        />
        {isPassword && (
          <button type="button" className="field__action" onClick={() => setShown((s) => !s)} aria-label={shown ? "Hide password" : "Show password"}>
            {shown ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error ? <p className="field__error" id={`${id}-err`} role="alert">{error}</p> : hint ? <p className="field__hint" id={`${id}-hint`}>{hint}</p> : null}
    </div>
  );
}
