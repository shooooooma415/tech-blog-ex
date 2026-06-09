export type SaveArticleButtonProps = {
  disabled: boolean;
  saving: boolean;
  onClick: () => void;
};

export function SaveArticleButton({
  disabled,
  saving,
  onClick,
}: SaveArticleButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || saving}
      onClick={onClick}
      className="w-full px-3 py-2 rounded-md bg-brand text-white font-medium hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {saving ? "保存中..." : "Notion に保存"}
    </button>
  );
}
