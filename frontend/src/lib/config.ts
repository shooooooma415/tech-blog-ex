// Backend URL はユーザーが変更する値ではなく、ビルド時に決まる定数として扱う。
// 本番デプロイ用に変えたい場合は ビルド時に NEXT_PUBLIC_BACKEND_URL を指定:
//   NEXT_PUBLIC_BACKEND_URL=https://your-backend.example.com pnpm build:extension
export const BACKEND_URL: string =
  process.env.NEXT_PUBLIC_BACKEND_URL?.trim() || "http://localhost:8080";
