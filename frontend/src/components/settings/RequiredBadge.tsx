export type RequiredLevel = "必須" | "任意";

const STYLES: Record<RequiredLevel, string> = {
  必須: "bg-rose-50 text-rose-700 border-rose-200",
  任意: "bg-gray-100 text-gray-600 border-gray-200",
};

export function RequiredBadge({ level }: { level: RequiredLevel }) {
  return (
    <span
      className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border ${STYLES[level]}`}
    >
      {level}
    </span>
  );
}
