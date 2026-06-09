export type PopupHeaderProps = {
  onOpenOptions: () => void;
};

export function PopupHeader({ onOpenOptions }: PopupHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-base font-semibold">Tech Blog Saver</h1>
      <button
        type="button"
        onClick={onOpenOptions}
        aria-label="設定を開く"
        className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 active:bg-gray-200"
      >
        設定
      </button>
    </header>
  );
}
