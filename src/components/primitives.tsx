import type { ReactNode } from "react";

/** Frosted-glass panel used across the app. */
export function GlassCard({
  children,
  className = "",
  strong = false,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  strong?: boolean;
  as?: "div" | "section" | "aside";
}) {
  return (
    <Tag className={`glass ${strong ? "glass-strong" : ""} ${className}`.trim()}>
      {children}
    </Tag>
  );
}

export interface SegOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

/** iOS-style segmented control. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = "md",
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel?: string;
  size?: "sm" | "md";
}) {
  return (
    <div className={`segmented segmented-${size}`} role="group" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`seg-btn ${value === opt.value ? "is-active" : ""}`}
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          title={opt.hint}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** Labeled form field wrapper. */
export function Field({
  label,
  children,
  hint,
  htmlFor,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  htmlFor?: string;
}) {
  return (
    <label className="field" htmlFor={htmlFor}>
      <span className="field-label">{label}</span>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

/** Validated numeric input; clamps to a minimum and blocks negatives. */
export function NumberInput({
  value,
  onChange,
  min = 0,
  step = 1,
  id,
  suffix,
  ariaLabel,
  invalid,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  id?: string;
  suffix?: string;
  ariaLabel?: string;
  invalid?: boolean;
}) {
  return (
    <span className={`num-input ${invalid ? "is-invalid" : ""}`}>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={Number.isFinite(value) ? value : ""}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isNaN(n)) return;
          onChange(Math.max(min, n));
        }}
      />
      {suffix ? <span className="num-suffix">{suffix}</span> : null}
    </span>
  );
}

/** Small round icon button. */
export function IconButton({
  children,
  onClick,
  title,
  variant = "ghost",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  title: string;
  variant?: "ghost" | "danger" | "primary";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`icon-btn icon-btn-${variant}`}
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
