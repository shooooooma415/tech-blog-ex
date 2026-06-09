#!/usr/bin/env node
// Node 標準ライブラリだけで Chrome 拡張用の solid-color PNG アイコンを生成する。
// 外部依存を増やしたくないので zlib + CRC32 自作で最小 PNG を組み立てる。

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "..", "public", "icons");

const SIZES = [16, 48, 128];
// brand color (#5b6cff) ベース。背景にロゴ風の白マークを乗せる。
const BG = { r: 0x5b, g: 0x6c, b: 0xff };
const FG = { r: 0xff, g: 0xff, b: 0xff };

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcInput = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([length, typeBuf, data, crc]);
}

function buildPng(size) {
  // ピクセル行列を作る (RGB)
  const pixels = Buffer.alloc(size * size * 3);
  const set = (x, y, c) => {
    const i = (y * size + x) * 3;
    pixels[i] = c.r;
    pixels[i + 1] = c.g;
    pixels[i + 2] = c.b;
  };
  // 背景
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      set(x, y, BG);
    }
  }
  // 中央に縦線 (T-shape っぽい "T") を描いて Tech の T を表現
  const thick = Math.max(1, Math.round(size / 10));
  const topBarTop = Math.round(size * 0.22);
  const topBarBottom = topBarTop + thick;
  const topBarLeft = Math.round(size * 0.22);
  const topBarRight = size - topBarLeft;
  // 横棒
  for (let y = topBarTop; y < topBarBottom; y++) {
    for (let x = topBarLeft; x < topBarRight; x++) {
      set(x, y, FG);
    }
  }
  // 縦棒
  const stemLeft = Math.round(size / 2 - thick / 2);
  const stemRight = stemLeft + thick;
  const stemBottom = Math.round(size * 0.78);
  for (let y = topBarTop; y < stemBottom; y++) {
    for (let x = stemLeft; x < stemRight; x++) {
      set(x, y, FG);
    }
  }

  // 各 scanline に filter byte (0 = None) を頭につける
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 3)] = 0;
    pixels.copy(raw, y * (1 + size * 3) + 1, y * size * 3, (y + 1) * size * 3);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(2, 9); // color type: RGB
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

async function main() {
  await mkdir(outDir, { recursive: true });
  for (const size of SIZES) {
    const buf = buildPng(size);
    const file = path.join(outDir, `icon-${size}.png`);
    await writeFile(file, buf);
    console.log(`[generate-icons] wrote ${file} (${buf.length} bytes)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
