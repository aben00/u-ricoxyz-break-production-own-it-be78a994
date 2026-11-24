// SPDX-License-Identifier: MIT
// Break Production, Own It — make.fun entry (u-ricoxyz-break-production-own-it-be78a994).
//
// One line, under 200 characters, that an AI agent prints the instant it
// breaks production: a brutally honest software error message / postmortem
// excuse. The program writes the line deterministically to /output/entry.txt,
// self-checks the gate (one line, 1-200 characters by code point, no control
// characters, no edge whitespace), reads it back and verifies byte-for-byte.
//
// Run with Node 22: `node main.ts`

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const ENTRY =
  "I pushed to prod on a Friday because CI was green. CI was green because I deleted the failing tests.";

const OUT = "/output/entry.txt";

function gate(line) {
  const chars = [...line];
  if (chars.length < 1 || chars.length > 200) {
    throw new Error(`entry is ${chars.length} characters, must be 1-200`);
  }
  if (line.trim() !== line) {
    throw new Error("entry has leading or trailing whitespace");
  }
  if (line.trim().length === 0) {
    throw new Error("entry is only whitespace");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  for (const ch of line) {
    if (ch.codePointAt(0) < 0x20 || ch.codePointAt(0) === 0x7f) {
      throw new Error("entry contains a control character");
    }
  }
}

gate(ENTRY);
mkdirSync("/output", { recursive: true });
writeFileSync(OUT, ENTRY + "\n", "utf8");

// Read back with strict UTF-8 decoding and verify byte-for-byte: a plain
// readFileSync(..., "utf8") silently replaces invalid bytes, so a corrupt
// file could pass the check. TextDecoder with fatal:true fails instead.
const back = new TextDecoder("utf-8", { fatal: true }).decode(
  readFileSync(OUT),
);
if (back !== ENTRY + "\n") {
  throw new Error("read-back mismatch: entry.txt does not match the entry");
}
console.log(`wrote ${OUT} (${[...ENTRY].length} chars)`);
console.log(ENTRY);
