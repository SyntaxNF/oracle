import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

// Supply an installed/built snf-parser ESM entry. No dependencies or generated
// .snf.json files are added to this definitions-only repository.
const parserEntry = process.argv[2];
if (!parserEntry) {
  console.error('Usage: node scripts/check-snf.mjs /absolute/path/to/snf-parser/dist/esm/index.mjs');
  process.exit(2);
}
const { SNFDocumentParser } = await import(pathToFileURL(path.resolve(parserEntry)).href);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directories = ['create', 'alter', 'drop', 'query', 'transaction', 'auth', 'other'];
const files = directories.flatMap(dir => fs.readdirSync(path.join(root, dir))
  .filter(name => name.endsWith('.snf')).map(name => `${dir}/${name}`)).sort();
const errors = [];
let blocks = 0, cases = 0, definitions = 0, nodes = 0;
for (const file of files) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const fail = message => errors.push(`${file}: ${message}`);
  if (!/^# https:\/\/docs\.oracle\.com\/en\/database\/oracle\/oracle-database\/19\//.test(source)) fail('missing official Oracle 19c first-line source');
  if (/[ \t]+$/m.test(source)) fail('trailing whitespace');
  const declared = new Map(), caseNames = new Set();
  let document;
  try { document = new SNFDocumentParser().parse(source); }
  catch (error) { fail(`parser: ${error.message}`); continue; }
  if (document.content !== source || document.lines.map(line => line.content + line.ending).join('') !== source) fail('source round-trip mismatch');
  blocks += document.blocks.length;
  let mode = null;
  for (const block of document.blocks) {
    const directives = [...block.comment.matchAll(/^# (CASE|WHERE|ONEOFIS|PARTOFIS|STATEMENT) (.+)$/gm)];
    if (directives.length > 1) fail(`multiple directives in block at line ${block.startLine}`);
    if (directives.length) {
      const [, kind, names] = directives[0]; mode = kind;
      for (const name of names.split(/\s*,\s*/)) {
        if (kind === 'CASE') {
          cases++;
          if (!/^[A-Z][A-Z0-9_]*$/.test(name)) fail(`invalid CASE ${name}`);
          if (caseNames.has(name)) fail(`duplicate CASE ${name}`);
          caseNames.add(name);
        } else {
          definitions++;
          if (!/^[a-z][a-z0-9_]*$/.test(name)) fail(`invalid helper ${name}`);
          if (declared.has(name)) fail(`duplicate helper ${name}`);
          declared.set(name, kind);
        }
      }
    }
    if (mode === 'ONEOFIS' && block.content) {
      for (const line of block.content.split('\n')) {
        try { new SNFDocumentParser().parse(line); }
        catch (error) { fail(`ONEOFIS candidate split across lines at ${block.startLine}: ${error.message}`); }
      }
    }
    const visit = node => {
      nodes++;
      if (typeof node.raw === 'string' && block.content.slice(node.start, node.end) !== node.raw) fail(`AST span mismatch at line ${block.startLine}`);
      for (const child of node.children ?? []) visit(child);
    };
    visit(block.ast);
  }
}
const result = { files: files.length, blocks, cases, helperDefinitions: definitions, astNodes: nodes, errors };
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
