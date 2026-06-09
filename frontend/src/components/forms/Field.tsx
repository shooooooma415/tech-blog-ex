import type { ReactNode } from "react";

export type FieldProps = {
  label: string;
  description?: ReactNode;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
};

/**
 * Form field wrapper: label + (optional) description + child input(s)
 * + (optional) validation error message.
 *
 * `htmlFor` を渡さない場合は <label> がそのまま子要素を包むので、
 * クリックでフォーカスが当たる挙動になる。
 */
export function Field({ label, description, error, htmlFor, children }: FieldProps) {
  const inner = (
    <>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {description && (
        <span className="block text-xs text-gray-500">{description}</span>
      )}
      {children}
      {error && (
        <span role="alert" className="block text-xs text-rose-600 mt-1">
          {error}
        </span>
      )}
    </>
  );

  if (htmlFor) {
    return (
      <div className="block space-y-1">
        <label htmlFor={htmlFor} className="block space-y-1">
          {inner}
        </label>
      </div>
    );
  }
  return <label className="block space-y-1">{inner}</label>;
}
