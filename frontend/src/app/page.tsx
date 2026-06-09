import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-xl font-bold">Tech Blog Saver</h1>
        <p className="text-sm text-gray-600">
          開発用エントリポイント。拡張機能としては <code>/popup</code> と{" "}
          <code>/options</code> が読み込まれます。
        </p>
        <div className="flex gap-2">
          <Link
            href="/popup"
            className="flex-1 text-center px-3 py-2 bg-brand text-white rounded-md hover:bg-brand-dark"
          >
            Popup を開く
          </Link>
          <Link
            href="/options"
            className="flex-1 text-center px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Options を開く
          </Link>
        </div>
      </div>
    </main>
  );
}
