import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
const src = '../README.md';
const dst = 'README.md';
mkdirSync(dirname(dst), { recursive: true });
copyFileSync(src, dst);
console.log(`Synced ${src} → ${dst}`);
