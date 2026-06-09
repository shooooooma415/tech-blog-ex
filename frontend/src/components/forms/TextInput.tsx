import type { InputHTMLAttributes } from "react";
import { inputClass } from "./inputClass";

type Common = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "className" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  mono?: boolean;
  className?: string;
};

function buildClass(error: boolean, mono: boolean, extra?: string) {
  return inputClass([mono ? "font-mono" : "", extra ?? ""].join(" "), error);
}

export function TextInput({
  value,
  onChange,
  error = false,
  mono = false,
  className,
  ...rest
}: Common) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={error || undefined}
      className={buildClass(error, mono, className)}
      autoComplete="off"
      {...rest}
    />
  );
}

export function PasswordInput({
  value,
  onChange,
  error = false,
  mono = true,
  className,
  ...rest
}: Common) {
  return (
    <input
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={error || undefined}
      className={buildClass(error, mono, className)}
      autoComplete="off"
      {...rest}
    />
  );
}

type NumberProps = Omit<Common, "value" | "onChange"> & {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  fallback?: number;
};

export function NumberInput({
  value,
  onChange,
  error = false,
  mono = false,
  className,
  min,
  max,
  fallback = 0,
  ...rest
}: NumberProps) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => {
        const n = Number(e.target.value);
        onChange(Number.isFinite(n) ? n : fallback);
      }}
      aria-invalid={error || undefined}
      className={buildClass(error, mono, className)}
      {...rest}
    />
  );
}
