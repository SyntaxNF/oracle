// These are definition/fixture regressions, NOT an Oracle semantic validator.
// LOOP is zero-or-more; no minimum-cardinality or SQL compatibility matrix is imposed.
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { parser, parserRevision } from '../scripts/parser-runtime.mjs';
import { root, files, inspect, inspectSource, source, document, visit } from '../scripts/check-snf.mjs';
import { fixture, parse, normalize, stripTrailingCommas } from '../scripts/generator-fixture.mjs';
const { NodeType: T } = parser;
const optionalContaining = text => node => node.content.includes(text);

for (const file of files) test(`parser/raw/span/directive/loop contract: ${file}`, () => assert.deepEqual(inspect(file).errors, []));
test('all 164 definitions use the intended actual parser source revision', () => {
    assert.equal(files.length, 164);
    assert.equal(parserRevision, 'bcf2c3ac58b45e7d5391716393586b00b11e0c1a');
});

test('checker rejects detached postfix repetition and purely redundant OPTIONAL wrappers', () => {
    const header = '# https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/SELECT.html\n\n';
    for (const text of ["'file_name' [, ...]", '( colname [, ...] ) [, ...]', 'ANY [, ...]']) {
        assert.ok(inspectSource(`${header}${text}\n`).errors.some(error => error.includes('detached postfix LOOP')), text);
    }
    for (const text of ['[ item [...] ]', '[ item [, ...] ]', '[ { first | second } [, ...] ]']) {
        assert.ok(inspectSource(`${header}${text}\n`).errors.some(error => error.includes('pure optional LOOP wrapper')), text);
    }
    for (const text of ['item [...]', '[ ORDER BY item [, ...] ]', '[ ( item [, ...] ) ]', '[ DECLARE item [...] ]']) {
        assert.deepEqual(inspectSource(`${header}${text}\n`).errors, [], text);
    }
});

test('fixture keeps quoted content and only cleans trailing commas inside parentheses', () => {
    assert.equal(normalize("  SELECT  'two  spaces' , 'it''s  quoted'  "), "SELECT 'two  spaces' , 'it''s  quoted'");
    assert.equal(stripTrailingCommas("( a, ( b, ), 'keep,)', ) trailing,"), "( a, ( b ), 'keep,)' ) trailing,");
});

// Quoted members must carry their quote marks through every repetition.
const quotedMembers = [
    ['create/controlfile.snf', 'quoted_file_name', 'file_name', '/data/a.dbf'],
    ['create/database.snf', 'quoted_file_name', 'file_name', '/data/a.dbf'],
    ['create/pluggable-database.snf', 'quoted_tablespace', 'tablespace', 'users'],
    ['create/pluggable-database.snf', 'quoted_container_database', 'container_database', 'cdb'],
    ['alter/database.snf', 'quoted_file_name', 'file_name', '/data/a.dbf'],
    ['alter/database.snf', 'quoted_replacement_file_name', 'replacement_file_name', '/new/a.dbf'],
    ['alter/diskgroup.snf', 'quoted_alias_name', 'alias_name', '+DATA/alias'],
    ['alter/diskgroup.snf', 'quoted_directory_path', 'directory_path', '+DATA/folder'],
    ['alter/diskgroup.snf', 'quoted_file_name', 'file_name', '+DATA/a.dbf'],
    ['alter/lockdown-profile.snf', 'quoted_feature', 'feature', 'AWR_ACCESS'],
    ['alter/lockdown-profile.snf', 'quoted_option', 'option', 'PARTITIONING'],
    ['alter/lockdown-profile.snf', 'quoted_sql_statement', 'sql_statement', 'ALTER SYSTEM'],
    ['alter/lockdown-profile.snf', 'quoted_clause', 'clause', 'SET'],
    ['alter/lockdown-profile.snf', 'quoted_clause_option', 'clause_option', 'OPEN_CURSORS'],
    ['alter/lockdown-profile.snf', 'quoted_option_value', 'option_value', '300'],
    ['alter/pluggable-database.snf', 'quoted_file_name', 'file_name', '/data/a.dbf'],
    ['alter/pluggable-database.snf', 'quoted_replacement_file_name', 'replacement_file_name', '/new/a.dbf'],
    ['alter/pluggable-database.snf', 'quoted_instance_name', 'instance_name', 'instance1'],
    ['alter/tablespace-set.snf', 'quoted_file_name', 'file_name', '/data/a.dbf'],
    ['alter/tablespace-set.snf', 'quoted_replacement_file_name', 'replacement_file_name', '/new/a.dbf'],
    ['alter/tablespace.snf', 'quoted_file_name', 'file_name', '/data/a.dbf'],
    ['alter/tablespace.snf', 'quoted_new_file_name', 'new_file_name', '/new/a.dbf'],
    ['other/administer-key-management.snf', 'quoted_key_id', 'key_id', 'key1'],
];
for (const [file, member, placeholder, value] of quotedMembers) for (const count of [0, 1, 2]) {
    test(`${file}: whole quoted ${member} × ${count}`, () => {
        const f = fixture(file), loop = f.loop(member);
        assert.equal(f.render(loop, {
            values: { [placeholder]: ({ indices }) => `${value}${indices[member]}` },
            count: (_, node) => node === loop ? count : 1,
        }), Array.from({ length: count }, (_, index) => `'${value}${index}'`).join(', '));
    });
}

const completeMembers = [
    ['create/operator.snf', 'primary_operator_binding', { primary_operator: 'op', parameter_type: 'NUMBER' }, 'op ( NUMBER )'],
    ['alter/operator.snf', 'primary_operator_binding', { primary_operator: 'op', parameter_type: 'NUMBER' }, 'op ( NUMBER )'],
    ['create/operator.snf', 'binding_definition', { parameter_type: 'NUMBER', return_type: 'NUMBER', function: 'eval_op' }, '( NUMBER ) RETURN NUMBER USING eval_op'],
    ['create/indextype.snf', 'operator_binding', { operator: 'op', parameter_type: 'NUMBER' }, 'op ( NUMBER )'],
    ['alter/indextype.snf', 'operator_action', { operator: 'op', parameter_type: 'NUMBER' }, 'ADD op ( NUMBER )'],
    ['create/indextype.snf', 'array_dml_type_definition', { type: 'item_type' }, '( item_type )'],
    ['alter/indextype.snf', 'array_dml_type_definition', { type: 'item_type' }, '( item_type )'],
    ['create/table.snf', 'list_partition_values', { literal: '10' }, '( 10 )'],
    ['alter/table.snf', 'list_partition_values', { literal: '10' }, '( 10 )'],
    ['query/select.snf', 'model_value_tuple', { literal_value: '10' }, '( 10 )'],
    ['query/select.snf', 'pivot_any_value', {}, 'ANY'],
    ['query/select.snf', 'with_query_definition', { with_name: 'q', query_statement: 'SELECT 1 FROM dual' }, 'q AS ( SELECT 1 FROM dual )'],
    ['query/select.snf', 'pivot_aggregate_expression', { aggregate_function: 'SUM', value_expression: 'amount' }, 'SUM ( amount )'],
    ['query/insert.snf', 'insert_into_clause', { table: 'target' }, 'INTO target', ' '],
    ['query/insert.snf', 'conditional_insert_clause', { boolean_expression: 'x > 0', table: 'target' }, 'WHEN x > 0 THEN INTO target', ' '],
    ['query/update.snf', 'column_assignment', { colname: 'c', value_expression: '42' }, 'c = 42'],
    ['query/merge.snf', 'column_assignment', { colname: 'c', value_expression: '42' }, 'c = 42'],
    ['alter/library.snf', 'compiler_parameter_assignment', { compiler_parameter: 'DEBUG', compiler_value: 'TRUE' }, 'DEBUG = TRUE', ' '],
    ['alter/diskgroup.snf', 'alias_definition', { alias_name: '+DATA/a', file_name: '+DATA/b' }, "'+DATA/a' FOR '+DATA/b'"],
    ['alter/diskgroup.snf', 'directory_rename', { directory_path: '+DATA/a', new_directory_path: '+DATA/b' }, "'+DATA/a' TO '+DATA/b'"],
    ['transaction/lock-table.snf', 'lock_target', { table: 't' }, 't'],
    ['other/plsql-block.snf', 'label_definition', { label: 'work' }, '<< work >>', ' '],
];
for (const [file, member, values, one, separator = ', '] of completeMembers) for (const count of [0, 1, 2]) {
    test(`${file}: complete ${member} × ${count}`, () => {
        const f = fixture(file), loop = f.loop(member);
        assert.equal(f.render(loop, { values, count: (_, node) => node === loop ? count : 1 }), Array(count).fill(one).join(separator));
    });
}

for (const file of ['create/indextype.snf', 'alter/indextype.snf']) test(`${file}: both ARRAY DML tuple fields repeat together`, () => {
    const f = fixture(file), loop = f.loop('array_dml_type_definition');
    assert.equal(f.render(loop, {
        values: { type: ({ indices }) => `t${indices.array_dml_type_definition}`, varray_type: ({ indices }) => `v${indices.array_dml_type_definition}` },
        include: optionalContaining('varray_type'), count: (_, node) => node === loop ? 2 : 1,
    }), '( t0 , v0 ), ( t1 , v1 )');
});

for (const file of ['create/table.snf', 'alter/table.snf']) for (const count of [0, 1, 2]) test(`${file}: independent tuple and inner-value loops × ${count}`, () => {
    const f = fixture(file), loop = f.loop('list_partition_values');
    assert.equal(f.render(loop, {
        values: { literal: ({ indices, index }) => String((indices.list_partition_values + 1) * 10 + index) },
        count: (_, node) => node === loop ? count : 2,
    }), ['', '( 10, 11 )', '( 10, 11 ), ( 20, 21 )'][count]);
});

test('empty inner lists retain every independently repeated tuple parenthesis', () => {
    const f = fixture('create/table.snf'), loop = f.loop('list_partition_values');
    assert.equal(f.render(loop, { count: (_, node) => node === loop ? 2 : 0 }), '( ), ( )');
});

test('SQL optional clauses retain their keyword and disappear as a whole', () => {
    const f = fixture('query/select.snf'), block = f.definitions.get('query_block')[0];
    const values = { table: 'sales', boolean_expression: 'amount > 0', col_expression: 'category', from_expression: 'sales' };
    assert.equal(f.render(block, { values }), 'SELECT * FROM sales');
    assert.equal(f.render(block, { values, include: optionalContaining('WHERE boolean_expression') }), 'SELECT * FROM sales WHERE amount > 0');
    assert.equal(f.render(block, { values, include: optionalContaining('GROUP BY') }), 'SELECT * FROM sales GROUP BY category');
});

test('parameter parentheses are a meaningful optional boundary; an inner list may be empty', () => {
    const f = fixture('create/procedure.snf'), block = f.block('# CASE PLSQL');
    const values = { name: 'p', plsql_statement: 'NULL;', parameter: 'n', data_type: 'NUMBER' };
    const count = member => member === 'declaration_definition' ? 0 : 1;
    assert.equal(f.render(block, { values, count }), 'CREATE PROCEDURE p IS BEGIN NULL; END ;');
    assert.equal(f.render(block, { values, count, include: optionalContaining('( parameter_definition') }), 'CREATE PROCEDURE p ( n NUMBER ) IS BEGIN NULL; END ;');
    assert.equal(f.render(block, { values, count: member => ['declaration_definition', 'parameter_definition'].includes(member) ? 0 : 1, include: optionalContaining('( parameter_definition') }), 'CREATE PROCEDURE p ( ) IS BEGIN NULL; END ;');
});

for (const count of [0, 1, 2]) test(`anonymous PL/SQL preserves supplied complete fragments × ${count}`, () => {
    const f = fixture('other/plsql-block.snf'), block = f.block('# CASE ANONYMOUS');
    assert.equal(f.render(block, {
        values: { plsql_statement: ({ indices }) => `x := ${indices.plsql_statement + 1};` },
        count: member => member === 'plsql_statement' ? count : 0,
    }), ['BEGIN END ;', 'BEGIN x := 1; END ;', 'BEGIN x := 1; x := 2; END ;'][count]);
});

test('DECLARE and EXCEPTION remain optional keyword-bearing clauses around free leaves', () => {
    const f = fixture('other/plsql-block.snf'), block = f.block('# CASE ANONYMOUS');
    assert.equal(f.render(block, {
        values: { declaration_definition: 'x NUMBER := 1;', plsql_statement: 'NULL;', exception_handler: 'WHEN OTHERS THEN RAISE;' },
        count: member => member === 'label_definition' ? 0 : 1,
        include: node => /DECLARE|EXCEPTION/.test(node.content),
    }), 'DECLARE x NUMBER := 1; BEGIN NULL; EXCEPTION WHEN OTHERS THEN RAISE; END ;');
});

for (const file of ['create/function.snf', 'create/procedure.snf', 'create/package-body.snf', 'create/trigger.snf', 'create/type-body.snf', 'other/plsql-block.snf']) {
    test(`${file}: executable PL/SQL leaves stay externally supplied`, () => {
        const f = fixture(file);
        assert.ok(f.definitions.has('plsql_body'));
        for (const leaf of ['declaration_definition', 'plsql_statement', 'exception_handler']) assert.equal(f.definitions.has(leaf), false, leaf);
        assert.doesNotMatch(source(file), /^\s*\/\s*$/m);
    });
}

test('package specification and initialization retain complete supplied declarations and statements', () => {
    const p = fixture('create/package.snf');
    assert.equal(p.render(p.block('# CASE SPECIFICATION'), { values: { name: 'p', package_data_definition: 'x NUMBER;' }, count: member => member === 'package_item_definition' ? 2 : 1 }), 'CREATE PACKAGE p IS x NUMBER; x NUMBER; END ;');
    const b = fixture('create/package-body.snf');
    assert.equal(b.render(b.block('# CASE BODY'), { values: { name: 'p', plsql_statement: 'NULL;' }, count: member => member === 'package_body_item_definition' ? 0 : 1, include: node => /^\s*BEGIN/.test(node.content) }), 'CREATE PACKAGE BODY p IS BEGIN NULL; END ;');
});

for (const attributes of [0, 1, 2]) for (const methods of [0, 1, 2]) test(`object type member commas: ${attributes} attributes, ${methods} methods`, () => {
    const f = fixture('create/type.snf');
    const body = [
        ...Array.from({ length: attributes }, (_, i) => `a${i} NUMBER`),
        ...Array.from({ length: methods }, (_, i) => `MEMBER PROCEDURE p${i}`),
    ];
    assert.equal(f.render(f.block('# CASE OBJECT'), {
        values: { name: 't', attribute: ({ indices }) => `a${indices.attribute_member}`, data_type: 'NUMBER', procedure: ({ indices }) => `p${indices.method_member}` },
        count: member => member === 'attribute_member' ? attributes : member === 'method_member' ? methods : 1,
    }), `CREATE TYPE t IS OBJECT ( ${body.length ? body.join(' , ') + ' ' : ''}) ;`);
});

test('MODEL literal square brackets survive raw decoding and render as SQL tokens', () => {
    const f = fixture('query/select.snf'), block = f.definitions.get('cell_assignment')[0];
    const nodes = []; visit(block, node => nodes.push(node));
    assert.ok(nodes.some(node => node.type === T.OTHER && node.content === '[' && node.raw === '\\['));
    assert.ok(nodes.some(node => node.type === T.OTHER && node.content === ']' && node.raw === '\\]'));
    assert.equal(f.render(block, { values: { measure_colname: 'sales', boolean_expression: 'region = 1' } }), 'sales [ region = 1 ]');
});

test('index variants describe four structural statement shapes', () => {
    const f = fixture('create/index.snf');
    assert.equal(f.render(f.block('# CASE TABLE'), { values: { name: 'i', table: 't', index_expression: 'c' } }), 'CREATE INDEX i ON t ( c )');
    assert.equal(f.render(f.block('# CASE CLUSTER'), { values: { name: 'i', cluster: 'c' } }), 'CREATE INDEX i ON CLUSTER c');
    assert.equal(f.render(f.block('# CASE BITMAP_JOIN'), { values: { name: 'i', table: 't', colname: 'c', boolean_expression: 't.id = u.id', join_table: 't, u' } }), 'CREATE BITMAP INDEX i ON t ( c ) FROM t, u WHERE t.id = u.id');
    assert.equal(f.render(f.block('# CASE DOMAIN'), { values: { name: 'i', table: 't', index_expression: 'c', indextype: 'ctxsys.context' } }), 'CREATE INDEX i ON t ( c ) INDEXTYPE IS ctxsys.context');
});

for (const count of [0, 1, 2]) test(`trigger events keep whole members and word separator × ${count}`, () => {
    const f = fixture('create/trigger.snf'), loop = f.loop('dml_event');
    assert.equal(f.render(loop, {
        values: { colname: ({ indices }) => `c${indices.dml_event}` },
        include: optionalContaining('OF colname'),
        choose: choices => Math.max(0, choices.findIndex(node => /^\s*UPDATE\b/.test(node.content))),
        count: (_, node) => node === loop ? count : 1,
    }), ['', 'UPDATE OF c0', 'UPDATE OF c0 OR UPDATE OF c1'][count]);
});

for (const [label, member, definition, expected] of [
    ['PARTITION_SPLIT_MULTIPLE_RANGE', 'range_partition_member', 'range_partition_definition', ['PARTITION p0 VALUES LESS THAN (10)', 'PARTITION p1 VALUES LESS THAN (20)']],
    ['PARTITION_SPLIT_MULTIPLE_LIST', 'list_partition_member', 'list_partition_definition', ['PARTITION p0 VALUES (10)', 'PARTITION p1 VALUES (20)']],
]) for (const count of [0, 1, 2]) test(`${label}: each repeated member owns its following comma × ${count}`, () => {
    const f = fixture('alter/table.snf');
    assert.equal(f.render(f.block(`# CASE ${label}`), {
        values: { name: 't', partition_selector: 'PARTITION old', partition_spec: 'PARTITION remainder', [definition]: ({ indices }) => expected[indices[member]] },
        count: candidate => candidate === member ? count : 1,
    }), `ALTER TABLE t SPLIT PARTITION old INTO ( ${[...expected.slice(0, count), 'PARTITION remainder'].join(' , ')} )`);
});

for (const file of ['create/profile.snf', 'alter/profile.snf']) test(`${file}: independent profile options can be selected alone or together`, () => {
    const f = fixture(file), options = f.definitions.get('profile_options')[0];
    const values = { sessions_per_user: '10', cpu_per_call: '1000' };
    assert.equal(f.render(options, { values }), '');
    assert.equal(f.render(options, { values, include: node => node.content.includes('SESSIONS_PER_USER') }), 'SESSIONS_PER_USER 10');
    assert.equal(f.render(options, { values, include: node => /SESSIONS_PER_USER|CPU_PER_CALL/.test(node.content) }), 'SESSIONS_PER_USER 10 CPU_PER_CALL 1000');
});

for (const count of [0, 1, 2]) test(`editioning-view columns repeat alias plus independently chosen visibility × ${count}`, () => {
    const f = fixture('create/view.snf'), loop = f.loop('editioning_column_definition');
    const values = { col_alias: ({ indices }) => `c${indices.editioning_column_definition}` };
    const repetition = (_, node) => node === loop ? count : 1;
    assert.equal(f.render(loop, { values, count: repetition }), ['', 'c0', 'c0, c1'][count]);
    assert.equal(f.render(loop, {
        values, count: repetition, include: () => true,
        choose: (choices, { indices }) => Math.max(0, choices.findIndex(node => node.content.trim() === (indices?.editioning_column_definition === 1 ? 'INVISIBLE' : 'VISIBLE'))),
    }), ['', 'c0 VISIBLE', 'c0 VISIBLE, c1 INVISIBLE'][count]);
});

test('managed recovery options combine once in their documented definition order', () => {
    const f = fixture('alter/database.snf'), options = f.definitions.get('managed_recovery_options')[0];
    assert.equal(f.render(options, { values: { scn_value: '42' }, include: node => /DISCONNECT|FROM SESSION|NODELAY|UNTIL/.test(node.content) }), 'DISCONNECT FROM SESSION NODELAY UNTIL CHANGE 42');
    assert.equal(f.render(options, { include: node => node.content.trim() === 'NODELAY' }), 'NODELAY');
});

test('user options keep independent defaults around the genuinely repeated quota members', () => {
    const f = fixture('alter/user.snf'), options = f.definitions.get('user_options')[0];
    assert.equal(f.render(options, {
        values: { tablespace: ({ indices }) => indices?.quota_clause === undefined ? 'main' : `q${indices.quota_clause}`, size_value: ({ indices }) => String((indices.quota_clause + 1) * 100), local_tablespace: 'local_temp', profile: 'app' },
        count: member => member === 'quota_clause' ? 2 : 1,
        include: node => /DEFAULT TABLESPACE|TEMPORARY TABLESPACE|PROFILE|ACCOUNT/.test(node.content),
    }), 'DEFAULT TABLESPACE main TEMPORARY TABLESPACE main LOCAL TEMPORARY TABLESPACE local_temp QUOTA 100 ON q0 QUOTA 200 ON q1 PROFILE app ACCOUNT LOCK');
});

test('lockdown value clauses combine once while VALUE preserves its quoted member list', () => {
    const f = fixture('alter/lockdown-profile.snf'), options = f.definitions.get('option_value_clauses')[0];
    assert.equal(f.render(options, { values: { option_value: '300' }, count: () => 2, include: () => true }), "VALUE = ( '300', '300' ) MINVALUE = '300' MAXVALUE = '300'");
    assert.equal(f.render(options, { values: { option_value: '300' }, include: node => /^\s*MAXVALUE/.test(node.content) }), "MAXVALUE = '300'");
});

for (const file of ['create/materialized-view.snf', 'alter/materialized-view.snf']) test(`${file}: refresh method, timing and modifiers stay independently selectable`, () => {
    const f = fixture(file), options = f.definitions.get('refresh_specification')[0];
    const values = { datetime_expression: 'CURRENT_DATE', next_datetime_expression: 'CURRENT_DATE + 1' };
    assert.equal(f.render(options, { values, include: node => /^\s*NEXT/.test(node.content) }), 'NEXT CURRENT_DATE + 1');
    assert.equal(f.render(options, { values, include: node => !node.content.includes('rollback_segment_clause') }), 'FAST ON COMMIT START WITH CURRENT_DATE NEXT CURRENT_DATE + 1 WITH PRIMARY KEY USING ENFORCED CONSTRAINTS');
});
