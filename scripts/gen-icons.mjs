/**
 * Generates the favicon / app icon set into static/ from the master SVG.
 * Run with: pnpm run gen:icons
 */
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { readFile, writeFile, copyFile } from 'node:fs/promises';

const SRC = new URL('../src/lib/assets/favicon.svg', import.meta.url);
const OUT = (name) => new URL(`../static/${name}`, import.meta.url);

const svg = await readFile(SRC);

const png = (size) => sharp(svg, { density: 300 }).resize(size, size).png().toBuffer();

await writeFile(OUT('favicon-32.png'), await png(32));
await writeFile(OUT('favicon-192.png'), await png(192));
await writeFile(OUT('favicon-512.png'), await png(512));
await writeFile(OUT('apple-touch-icon.png'), await png(180));
await writeFile(OUT('favicon.ico'), await pngToIco([await png(16), await png(32), await png(48)]));
await copyFile(SRC, OUT('favicon.svg'));

console.log('icons written to static/');
