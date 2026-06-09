import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tech Blog Saver",
  description: "技術ブログを Notion に保存するブラウザ拡張",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
