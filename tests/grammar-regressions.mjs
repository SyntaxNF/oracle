import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const parserEntry = process.argv[2];
if (!parserEntry) throw new Error('Supply snf-parser ESM entry as first argument');
const { SNFDocumentParser, NodeType } = await import(pathToFileURL(path.resolve(parserEntry)).href);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let checks = 0;
const check = (label, fn) => { fn(); checks++; console.log(`ok ${checks} - ${label}`); };
function grammar(file) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const document = new SNFDocumentParser().parse(source);
  const groups = new Map(); let names = [];
  for (const block of document.blocks) {
    const match = block.comment.match(/^# (CASE|WHERE|PARTOFIS|ONEOFIS|STATEMENT) (.+)$/m);
    if (match) {
      names = match[2].split(/\s*,\s*/);
      for (const name of names) groups.set(name, []);
    }
    if (block.content) for (const name of names) groups.get(name)?.push(block);
  }
  const text = name => (groups.get(name) ?? []).map(b => b.content).join('\n\n');
  const reach = (name, seen = new Set()) => {
    if (seen.has(name)) return ''; seen.add(name);
    const value = text(name);
    return value + '\n' + [...value.matchAll(/\b[a-z][a-z0-9_]*\b/g)]
      .filter(m => groups.has(m[0])).map(m => reach(m[0], seen)).join('\n');
  };
  return { source, document, groups, text, reach };
}
const q = grammar('query/select.snf');
for (const name of ['model_clause', 'pivot_clause', 'unpivot_clause', 'row_pattern_clause', 'cell_assignment', 'search_clause', 'cycle_clause'])
  check(`SELECT ${name} is a defined node`, () => assert(q.text(name)));
check('LATERAL cannot receive pivot/unpivot/pattern modifiers', () => {
  const lateral = q.groups.get('from_expression').filter(b => /\bLATERAL\b/.test(b.content));
  assert.equal(lateral.length, 1);
  assert.doesNotMatch(lateral[0].content, /pivot_clause|unpivot_clause|row_pattern_clause/);
  assert.doesNotMatch(q.text('table_expression'), /LATERAL/);
});
check('MODEL literal brackets survive parser decoding', () => {
  const nodes = []; const walk = n => { nodes.push(n); (n.children ?? []).forEach(walk); };
  q.groups.get('cell_assignment').forEach(b => walk(b.ast));
  assert(nodes.some(n => n.type === NodeType.OTHER && n.content === '[' && n.raw === '\\['));
  assert(nodes.some(n => n.type === NodeType.OTHER && n.content === ']' && n.raw === '\\]'));
});
for (const file of ['create/operator.snf', 'alter/operator.snf'])
  check(`${file} repeats the whole ancillary binding`, () => {
    const g = grammar(file); assert.match(g.text('implementation_clause'), /primary_operator_binding \[, \.\.\.\]/);
    assert.match(g.text('primary_operator_binding'), /primary_operator \( parameter_type \[, \.\.\.\] \)/);
  });
check('Library compiler assignments repeat as units', () => {
  const g = grammar('alter/library.snf'); assert.match(g.text('COMPILE'), /compiler_parameter_assignment \[\.\.\.\]/);
  assert.match(g.text('compiler_parameter_assignment'), /compiler_parameter = compiler_value/);
});
const table = grammar('create/table.snf');
check('Temporary columns exclude invisible columns and foreign keys', () => {
  assert.doesNotMatch(table.reach('TEMPORARY'), /\bINVISIBLE\b|\bREFERENCES\b|FOREIGN KEY/);
});
check('Private temporary columns exclude defaults and foreign keys', () => {
  assert.doesNotMatch(table.reach('PRIVATE_TEMPORARY'), /\bDEFAULT\b|\bINVISIBLE\b|\bREFERENCES\b/);
});
const index = grammar('create/index.snf');
for (const name of ['TABLE_BITMAP', 'LOCAL_BITMAP', 'BITMAP_JOIN'])
  check(`${name} excludes reverse/nosort/compression`, () => assert.doesNotMatch(index.reach(name), /\bREVERSE\b|\bNOSORT\b|\bCOMPRESS\b/));
for (const name of ['TABLE_UNIQUE', 'LOCAL_UNIQUE', 'GLOBAL_RANGE_UNIQUE', 'GLOBAL_HASH_UNIQUE'])
  check(`${name} excludes partial indexing`, () => assert.doesNotMatch(index.reach(name), /\bPARTIAL\b/));
check('ALTER INDEX generic physical attributes exclude PCTFREE', () => assert.doesNotMatch(grammar('alter/index.snf').reach('PHYSICAL_ATTRIBUTES'), /\bPCTFREE\b/));
const trigger = grammar('create/trigger.snf');
check('Normal trigger ordering excludes PRECEDES', () => assert.doesNotMatch(trigger.text('ROW_DML_NORMAL'), /PRECEDES/));
check('CALL trigger excludes REFERENCING', () => assert.doesNotMatch(trigger.text('ROW_DML_NORMAL_CALL'), /REFERENCING|referencing_clause/));
check('Reverse crossedition trigger retains PRECEDES', () => assert.match(trigger.text('ROW_DML_REVERSE'), /PRECEDES|reverse_ordering/));
check('Compound noneditioning view has dedicated branch', () => assert.match(trigger.text('COMPOUND_NONEDITIONING_VIEW'), /INSTEAD OF EACH ROW/));
for (const file of ['create/function.snf', 'create/procedure.snf', 'create/trigger.snf', 'other/plsql-block.snf'])
  check(`${file} does not offer SERIALLY_REUSABLE`, () => assert.doesNotMatch(grammar(file).source, /SERIALLY_REUSABLE/));
for (const file of ['create/profile.snf', 'alter/profile.snf'])
  check(`${file} requires a profile option`, () => assert.match(grammar(file).source, /LIMIT profile_option \[\.\.\.\]/));
check('Statistics index partition uses INDNAME => index', () => assert.match(grammar('other/statistics.snf').text('INDEX_PARTITION'), /INDNAME => index/));
for (const file of ['create/materialized-view.snf', 'alter/materialized-view.snf'])
  check(`${file} USING INDEX excludes PCTFREE/PCTUSED`, () => assert.doesNotMatch(grammar(file).reach('index_attribute'), /\bPCTFREE\b|\bPCTUSED\b/));
check('Catalogue is exhaustive over its declared entries and all files resolve', () => {
  const inventory = JSON.parse(fs.readFileSync(path.join(root, 'docs/statement-inventory.json'), 'utf8'));
  assert.equal(inventory.statements.length, 161);
  assert.equal(new Set(inventory.statements.map(x => x.statement)).size, 161);
  for (const entry of inventory.statements) {
    assert(['structured', 'partial'].includes(entry.status)); assert(entry.coverage && entry.remaining);
    for (const file of entry.files) assert(fs.existsSync(path.join(root, file)), file);
  }
});
console.log(`${checks} grammar regression checks passed. These check SNF structure, not Oracle SQL execution.`);
