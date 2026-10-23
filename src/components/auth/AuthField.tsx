import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: LucideIcon;
  error?: string | null;
  hint?: ReactNode;
  revealable?: boolean;
};

export const AuthField = forwardRef<HTMLInputElement, Props>(function AuthField(
  { label, icon: Icon, error, hint, revealable, type = "text", required, id, className, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const [visible, setVisible] = useState(false);
  const inputType = revealable ? (visible ? "text" : "password") : type;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={inputId} className="block text-[15px] font-semibold text-foreground">
        {label}
        {required && (
          <span aria-hidden="true" className="text-primary">
            *
          </span>
        )}
      </label>
      <div
        className={cn(
          "group flex h-12 items-center short:h-11 gap-3 rounded-md border bg-field px-4 transition-[border-color,box-shadow] duration-150",
          "focus-within:border-brand focus-within:shadow-focus",
          error ? "border-destructive" : "border-input hover:border-foreground/60",
        )}
      >
        <Icon
          aria-hidden="true"
          className={cn(
            "size-5 shrink-0 transition-colors",
            error ? "text-destructive" : "text-muted-foreground group-focus-within:text-brand",
          )}
        />
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={[error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          {...props}
        />
        {revealable && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={visible}
            className="-mr-1 rounded p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        )}
      </div>
      {hint && <div id={hintId}>{hint}</div>}
      {error && (
        <p id={errorId} role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
});
