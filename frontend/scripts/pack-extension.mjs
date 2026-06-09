#!/usr/bin/env node
// next build (output: 'export') で `out/` に生成された static ファイルから
// Chrome 拡張用のディレクトリ `extension-dist/` を組み立てるスクリプト。
//
// Chrome 拡張は `_` 始まりのファイル/ディレクトリ名を許可しないため、
//   - `_next/` を `next/` にリネーム
//   - 階層内の `_xxx` も `xxx` に再帰的にリネーム
//   - テキストファイル内の参照も同様に書き換え
// を行う。
//
// さらに MV3 の CSP は inline <script> を禁止するため、 HTML 内の
// `<script>...</script>` (src なし) を外部 .js ファイルへ抽出する。

import { createHash } from "node:crypto";
import {
  cp,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "out");
const distDir = path.join(root, "extension-dist");

const REWRITE_EXTENSIONS = new Set([
  ".html",
  ".js",
  ".mjs",
  ".css",
  ".json",
  ".txt",
  ".map",
]);

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    out.push({ path: full, name: entry.name, isDir: entry.isDirectory() });
    if (entry.isDirectory()) {
      await walk(full, out);
    }
  }
  return out;
}

function renameNoUnderscore(name) {
  // 先頭の `_` を取り除く。`_app` → `app`, `__html` のような二重には触れない。
  if (name.startsWith("_") && !name.startsWith("__")) {
    return name.slice(1);
  }
  return name;
}

async function collectUnderscoreNames(rootDir) {
  // ファイル名 (basename) を集める。重複を排除した Set を返す。
  const names = new Set();
  const entries = await walk(rootDir);
  for (const e of entries) {
    if (e.name.startsWith("_") && !e.name.startsWith("__")) {
      names.add(e.name);
    }
  }
  return [...names];
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function rewriteReferences(rootDir, names) {
  if (names.length === 0) return;
  // 長い名前から処理 (短い名前が他の名前の prefix にならないように)。
  const sorted = [...names].sort((a, b) => b.length - a.length);
  // 文脈を限定: 前は単語文字 (A-Z, a-z, 0-9, _) 以外。これにより
  //   `self.__next_f` の `_next` (前に `_` がある) は対象外、
  //   `/_next/`, `"_app-x.js"`, `(_next/` などのファイル参照だけが対象になる。
  const replacements = sorted.map((n) => ({
    pattern: new RegExp(`(?<![A-Za-z0-9_])${escapeRegex(n)}`, "g"),
    to: renameNoUnderscore(n),
  }));

  const entries = await walk(rootDir);
  for (const e of entries) {
    if (e.isDir) continue;
    const ext = path.extname(e.path).toLowerCase();
    if (!REWRITE_EXTENSIONS.has(ext)) continue;
    const original = await readFile(e.path, "utf8");
    let updated = original;
    for (const { pattern, to } of replacements) {
      updated = updated.replace(pattern, to);
    }
    if (updated !== original) {
      await writeFile(e.path, updated, "utf8");
    }
  }
}

async function renameUnderscoreEntries(rootDir) {
  // 深い階層から (bottom-up) リネームする。親ディレクトリのパスが変わると
  // 子のパスが無効になるため。
  const entries = await walk(rootDir);
  entries.sort((a, b) => b.path.length - a.path.length);
  for (const e of entries) {
    if (!e.name.startsWith("_") || e.name.startsWith("__")) continue;
    const newName = renameNoUnderscore(e.name);
    const dir = path.dirname(e.path);
    const target = path.join(dir, newName);
    if (await exists(target)) {
      // 衝突する場合はスキップ (理屈上ありえないが念のため)
      console.warn(
        `[pack-extension] skip rename due to collision: ${e.path} -> ${target}`,
      );
      continue;
    }
    await rename(e.path, target);
  }
}

async function extractInlineScripts(rootDir) {
  // MV3 CSP は inline <script> を実行しないので、 HTML の `<script>...</script>`
  // (src 属性なし、内容あり) を外部 .js に逃がす。
  const inlineDir = path.join(rootDir, "inline-scripts");
  let counter = 0;
  const entries = await walk(rootDir);
  for (const e of entries) {
    if (e.isDir) continue;
    if (path.extname(e.path).toLowerCase() !== ".html") continue;
    const html = await readFile(e.path, "utf8");
    // 開き <script> に src/type=module 等が無いものだけ対象。
    const re =
      /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g;
    let changed = false;
    let result = "";
    let lastIndex = 0;
    let m;
    while ((m = re.exec(html)) !== null) {
      const [full, attrs, content] = m;
      if (content.trim() === "") {
        // 空 <script></script> はそのまま残す
        continue;
      }
      if (!changed) {
        await mkdir(inlineDir, { recursive: true });
      }
      changed = true;
      const hash = createHash("sha1")
        .update(content)
        .digest("hex")
        .slice(0, 10);
      counter += 1;
      const filename = `inline-${hash}-${counter}.js`;
      await writeFile(path.join(inlineDir, filename), content, "utf8");
      result += html.slice(lastIndex, m.index);
      const cleanedAttrs = attrs.trim();
      result += `<script${cleanedAttrs ? " " + cleanedAttrs : ""} src="/inline-scripts/${filename}"></script>`;
      lastIndex = m.index + full.length;
    }
    if (changed) {
      result += html.slice(lastIndex);
      await writeFile(e.path, result, "utf8");
    }
  }
  return counter;
}

async function main() {
  if (!(await exists(outDir))) {
    console.error(
      `[pack-extension] '${outDir}' が見つかりません。先に 'next build' を実行してください。`,
    );
    process.exit(1);
  }

  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  await cp(outDir, distDir, { recursive: true });

  // 1. 参照を書き換える前に、対象ファイル名を全部収集する (リネーム前の名前で)
  const names = await collectUnderscoreNames(distDir);
  if (names.length > 0) {
    console.log(`[pack-extension] rewriting refs: ${names.join(", ")}`);
    await rewriteReferences(distDir, names);
    await renameUnderscoreEntries(distDir);
  }

  // 2. inline <script> を抽出して MV3 CSP に適合させる
  const extracted = await extractInlineScripts(distDir);
  if (extracted > 0) {
    console.log(`[pack-extension] extracted ${extracted} inline scripts`);
  }

  console.log(`[pack-extension] built extension at: ${distDir}`);
  console.log(
    "  Chrome の chrome://extensions/ から 'パッケージ化されていない拡張機能を読み込む' で選択してください。",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
