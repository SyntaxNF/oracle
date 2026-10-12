# Oracle SNF

本仓库维护 Oracle Database 19c 的 SNF（Syntax Normal Form）模板，用于阅读 SQL 与 PL/SQL 语法，并为语法编辑器和 SQL 生成器提供结构化输入。

## 版本基线

以 Oracle Database 19c 的 [SQL Language Reference](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/index.html)、[PL/SQL Language Reference](https://docs.oracle.com/en/database/oracle/oracle-database/19/lnpls/index.html) 和 [PL/SQL Packages and Types Reference](https://docs.oracle.com/en/database/oracle/oracle-database/19/arpls/index.html) 为基线。每个 `.snf` 文件首行链接到对应的官方文档页，不混入其他版本或未固定最低 RU 的扩展。

覆盖范围以仓库中的模板为准，文件存在不代表已覆盖对应语句的全部语法。

## 目录

- `create/`、`alter/`、`drop/`：数据库对象的创建、修改与删除。
- `query/`：查询与 DML。
- `transaction/`：事务、保存点与锁定。
- `auth/`：授权、撤销授权、审计与角色设置。
- `other/`：注释、刷新、截断及其他操作。
- `scripts/`：结构检查与回归工具。
- `tests/`：方言回归用例。

## 使用

使用 [snf-parser](https://github.com/SyntaxNF/parser) 读取 `.snf` 文件，选择顶层入口，再由消费方提供标识符、表达式、类型和语句体等输入。SNF 记号、定义指令与 AST 接口统一见 [parser 使用说明](https://github.com/SyntaxNF/parser#使用)和 [SNF 参考](https://github.com/SyntaxNF/parser/blob/main/docs/snf-reference.md)。

模板按 SQL 语句组织，同一语句的变体使用 `CASE`。应用中的操作映射、默认值、分支限制、标识符引用、输入参数化、权限与执行流程由消费方负责；创建与替换操作复用创建模板。

生成器应遵循 [parser 的生成约定](https://github.com/SyntaxNF/parser/blob/main/docs/snf-reference.md#生成时的分组间隔)，并清理模板结构产生的 SQL 圆括号内尾逗号，保留调用方提供的输入文本。

## 方言输入约定

- 模板已含单引号时，只传入正确转义的内部内容；`CALL` 的 host/indicator 变量冒号由模板输出，输入不重复包含 `:`。
- 表达式、Java/C 外部内容和未展开的领域语言作为完整输入提供。
- `declaration_definition`、`package_data_definition`、`plsql_statement` 是自带分号的完整片段；`exception_handler` 包含完整 `WHEN ... THEN ...` 和内部语句分号。模板提供外层 `BEGIN`、`EXCEPTION`、`END [name] ;`，不为输入片段补分号，也不附加 SQL*Plus 的 `/`。

## 维护与检查

维护时先阅读 [AGENTS.md](AGENTS.md)。检查命令按需手动运行；它们验证 SNF 结构与测试辅助生成行为，不执行数据库 SQL。

使用 Node.js 22，先安装并构建 parser，再显式指定本地构建。本仓库无需安装依赖：

```sh
(cd /absolute/path/to/parser && pnpm install --frozen-lockfile && pnpm build)
export SNF_PARSER_WORKTREE_MODULE=/absolute/path/to/parser/dist/esm/index.mjs
npm run validate
npm test
```

`npm run validate` 执行结构检查，`npm test` 执行回归检查；`validate:snf` 和 `test:regression` 是对应入口。脚本必须通过 `SNF_PARSER_WORKTREE_MODULE` 加载 parser，修改 parser 后需重新构建。

可通过 `SNF_ROOT=/absolute/path/to/oracle-tree` 指定另一份待检查的模板目录。

定义使用小写、连字符文件名，首行保留官方来源链接。公共检查契约变更需同步四个模板仓库；生成的 `*.snf.json` 不手工修改或提交。

## 许可证

[MIT](LICENSE)，Copyright (C) 2020-present, baskwind。
