# Oracle SNF Guidelines

Target Oracle Database 19c. Use uppercase SQL keywords, lowercase semantic placeholders and lowercase hyphenated files in statement-family directories. Start definitions with an official Oracle documentation URL. Definitions describe Oracle syntax independently of any consuming application. Do not manually edit generated .snf.json. Do not run tests or type checks automatically after edits.

For multiline parenthesized blocks, append the SQL opening `(` or `[ (` to the preceding statement line, indent the contents by four spaces, and place the matching `)` or `) ]` on its own line. Put a multiline enum's `{` on its own indented line and its alternatives one level deeper; do not combine `(` with a multiline enum opener. Compact single-line lists may stay inline. ONEOFIS candidates must remain single physical lines.

## SQL grammar ownership

Organize definitions by SQL statement, using CASE for syntax variants. Do not copy or trim a definition for an application menu, object action, or safety policy. Consumers own operation-to-definition mappings, case/branch allowlists, defaults, target locks, authorization and execution workflows. Represent SQL options in the grammar even when a consumer restricts them. Reuse CREATE definitions for replacement actions; do not add rebuild or definition copies.
