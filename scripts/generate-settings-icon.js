'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// --- CRC32 ---
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    crcTable[n] = c;
}
function crc32(buf) {
    let c = 0xFFFFFFFF;
    for (const b of buf) c = crcTable[(c ^ b) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
    const t = Buffer.from(type, 'ascii');
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
    return Buffer.concat([len, t, data, crcBuf]);
}

function makePNG(w, h, rgba) {
    const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(w, 0);
    ihdr.writeUInt32BE(h, 4);
    ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA

    const rowLen = 1 + w * 4;
    const raw = Buffer.alloc(h * rowLen, 0);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const si = (y * w + x) * 4;
            const di = y * rowLen + 1 + x * 4;
            raw[di] = rgba[si];
            raw[di + 1] = rgba[si + 1];
            raw[di + 2] = rgba[si + 2];
            raw[di + 3] = rgba[si + 3];
        }
    }
    const idat = zlib.deflateSync(raw, { level: 9 });
    return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

function drawCogwheel(size) {
    const rgba = new Uint8Array(size * size * 4);
    const cx = (size - 1) / 2;
    const cy = (size - 1) / 2;
    const OUTER = size * 0.44;
    const INNER = size * 0.30;
    const HOLE = size * 0.16;
    const TEETH = 8;
    const HALF = (Math.PI / TEETH) * 0.62; // tooth width

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dx = x - cx, dy = y - cy;
            const r = Math.sqrt(dx * dx + dy * dy);
            if (r < HOLE || r > OUTER) continue;

            let inside = r <= INNER;
            if (!inside) {
                const a = Math.atan2(dy, dx);
                const seg = ((a % (2 * Math.PI / TEETH)) + 2 * Math.PI) % (2 * Math.PI / TEETH);
                inside = Math.abs(seg - Math.PI / TEETH) < HALF;
            }

            if (inside) {
                const i = (y * size + x) * 4;
                // Black pixel, fully opaque
                rgba[i + 3] = 255;
            }
        }
    }
    return rgba;
}

const outDir = path.join(__dirname, '..', 'assets', 'images', 'tabIcons');
const targets = [
    [24, 'settings.png'],
    [48, 'settings@2x.png'],
    [72, 'settings@3x.png'],
];
for (const [size, name] of targets) {
    const png = makePNG(size, size, drawCogwheel(size));
    fs.writeFileSync(path.join(outDir, name), png);
    console.log(`✓ ${name} (${size}x${size})`);
}
