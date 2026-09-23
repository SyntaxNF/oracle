# Oracle SNF Guidelines

Target Oracle Database 19c. Use uppercase SQL keywords, lowercase semantic placeholders and lowercase hyphenated files in statement-family directories. Start definitions with an official Oracle documentation URL. Definitions describe Oracle syntax independently of any consuming application. Do not manually edit generated .snf.json. Do not run tests or type checks automatically after edits.

## SQL grammar ownership

Organize definitions by SQL statement, using CASE for syntax variants. Do not copy or trim a definition for an application menu, object action, or safety policy. Consumers own operation-to-definition mappings, case/branch allowlists, defaults, target locks, authorization and execution workflows. Represent SQL options in the grammar even when a consumer restricts them. Reuse CREATE definitions for replacement actions; do not add rebuild or definition copies.
