import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface ImageSize {
  width: number;
  height: number;
}

const fallback: ImageSize = { width: 1200, height: 800 };

function fromPng(buffer: Buffer): ImageSize | undefined {
  if (buffer.length < 24 || buffer.readUInt32BE(0) !== 0x89504e47) return undefined;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function fromJpeg(buffer: Buffer): ImageSize | undefined {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return undefined;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) return undefined;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    // SOF0–SOF15 中除 DHT/JPG/DAC 之外的帧头带有尺寸。
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return undefined;
}

function fromWebp(buffer: Buffer): ImageSize | undefined {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    return undefined;
  }
  const format = buffer.toString('ascii', 12, 16);
  if (format === 'VP8X') {
    return { width: buffer.readUIntLE(24, 3) + 1, height: buffer.readUIntLE(27, 3) + 1 };
  }
  if (format === 'VP8 ') {
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  }
  if (format === 'VP8L') {
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return undefined;
}

function fromSvg(source: string): ImageSize | undefined {
  const width = source.match(/\swidth="(\d+(?:\.\d+)?)/);
  const height = source.match(/\sheight="(\d+(?:\.\d+)?)/);
  if (width && height) return { width: Math.round(+width[1]), height: Math.round(+height[1]) };
  const viewBox = source.match(/viewBox="([\d.\s-]+)"/);
  if (viewBox) {
    const [, , boxWidth, boxHeight] = viewBox[1].trim().split(/\s+/);
    return { width: Math.round(+boxWidth), height: Math.round(+boxHeight) };
  }
  return undefined;
}

// 档案路径从 public/ 开始，构建期直接读原文件取真实尺寸。
export function readPublicImageSize(path: string): ImageSize {
  try {
    const buffer = readFileSync(join(process.cwd(), 'public', path));
    if (path.endsWith('.svg')) return fromSvg(buffer.toString('utf8')) ?? fallback;
    return fromPng(buffer) ?? fromJpeg(buffer) ?? fromWebp(buffer) ?? fallback;
  } catch {
    return fallback;
  }
}
