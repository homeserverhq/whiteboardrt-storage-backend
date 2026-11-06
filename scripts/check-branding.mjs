#!/usr/bin/env node
// Guard the WhiteboardRT Storage Backend surface against stale upstream
// names and publishing targets. Attribution in README.md, LICENSE, and
// THIRD_PARTY_NOTICES.md is intentionally out of scope.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const files = [
  'package.json',
  'package-lock.json',
  'docker-compose.yml',
  'Dockerfile',
  '.github/workflows/ci.yaml',
];

for (const directory of ['src', 'test']) {
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.ts')) {
        files.push(path.relative(root, full));
      }
    }
  };
  walk(path.join(root, directory));
}

const forbidden = [
  /excalidraw-storage-backend/i,
  /kiliandeca/i,
  /alswl/i,
  /excalidraw\/excalidraw-room/i,
  /hub\.docker\.com/i,
];

let failed = false;
for (const file of [...new Set(files)]) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  const contents = fs.readFileSync(full, 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(contents)) {
      process.stderr.write(`${file}: matched ${pattern}\n`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

process.stdout.write('branding checks passed\n');
