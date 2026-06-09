export function NotConfiguredBanner() {
  return (
    <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded px-2 py-2">
      Notion の API キーと「保存先ページ ID」が未設定です。「設定」から登録してください。
      <br />
      <span className="opacity-70">
        (mock モードのため未設定でも動作確認は可能です)
      </span>
    </div>
  );
}
