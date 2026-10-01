# Oracle SNF

本仓库维护 Oracle Database 19c 的 SNF（Syntax Normal Form）定义，用于阅读语法和生成规范 SQL。定义按 SQL 语句或 PL/SQL 过程调用族组织，同一句法的变体使用 CASE。

## 版本与目录

语法基线为 Oracle Database 19c 的 [SQL Language Reference](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/index.html)、[PL/SQL Language Reference](https://docs.oracle.com/en/database/oracle/oracle-database/19/lnpls/index.html) 和 [PL/SQL Packages and Types Reference](https://docs.oracle.com/en/database/oracle/oracle-database/19/arpls/index.html)。每个 `.snf` 文件首行链接到对应的官方文档页；不混入其他版本或未固定最低 RU 的扩展。

- `create/`：创建数据库对象
- `alter/`：修改数据库对象及其状态
- `drop/`：删除数据库对象
- `query/`：查询、插入、更新、删除和合并
- `transaction/`：事务、保存点和锁定
- `auth/`：授权、撤销授权、审计和角色设置
- `other/`：注释、刷新、截断及其他操作

## SNF 记号

| 记号 | 含义 |
| --- | --- |
| `KEYWORD` | 原样生成的 SQL 关键字 |
| `placeholder` | 调用方输入或其他语法节点 |
| `[ syntax ]` | 整段可选，最多出现一次 |
| `{ a \| b }` | 从候选项中选择一个 |
| `item [...]` | 重复前面的完整成员，次数为 0、1、2……，无额外分隔符 |
| `item [, ...]`、`statement [; ...]` | 重复完整成员，次数为 0、1、2……，分别用逗号、分号分隔 |
| `( syntax )`、`'value'` | 原样生成的 SQL 圆括号、字符串引号 |
| `# CASE label` | 完整语法的顶层分支 |
| `# WHERE name` | 可复用语法节点；相同语法可用逗号声明多个名称 |
| `# ONEOFIS name` | 每个物理行是一个候选 |
| `# PARTOFIS name` | 每个空行分隔的 block 是一个候选 |
| `# STATEMENT name` | 可嵌套的 statement 节点，不作为当前文件的顶层语法 |

例如：

```snf
CREATE TABLE name ( column_definition [, ...] )

# WHERE column_definition
colname data_type [ DEFAULT default_expression ] [ NOT NULL ]
```

## 输入与生成

- SQL 关键字和 PL/SQL 命名参数使用大写，占位符和带连字符的文件名使用小写。主对象名使用 `name`，其重命名目标使用 `new_name`；其他标识符使用对象类型或上下文名，如 `table`、`referenced_table`、`colname`。
- 节点按角色使用 `_statement`、`_expression`、`_definition`、`_clause`、`_option` / `_options`、`_action`、`_value`；表达式与受限值分开命名。
- LOOP 包含完整成员及其前缀、引号、括号和后缀，没有额外必选首项。纯 `[ item [...] ]` 外壳冗余；带关键字或字面括号的整段可选项保留，如 `[ USING argument [, ...] ]`。
- 独立、单次属性按固定顺序写为可选项；列、参数、文件、分区等真正的列表使用 LOOP。圆括号内相邻可空列表可由成员携带尾逗号，消费方生成时清理最后一个逗号。
- 模板已含单引号时，输入仅提供内部正确转义的内容，例如 `quoted_file_name` 中的 `file_name`；`CALL` 的 host/indicator 变量冒号由模板输出，输入不要重复包含 `:`。
- `query_statement` 可复用 SELECT 定义；表达式、Java/C 外部内容和未展开的领域语言作为完整自由输入。
- `declaration_definition`、`package_data_definition`、`plsql_statement` 是自带分号的完整自由片段；`exception_handler` 包含完整 `WHEN ... THEN ...` 及内部语句分号。模板提供外层 `BEGIN`、`EXCEPTION`、`END [name] ;`，不为自由片段补分号，不附加 SQL*Plus 的 `/`。

## 使用与维护

Studio 的 `snf/oracle` 包将各目录构建为 Oracle SNF Pages。消费方负责定义路径和 CASE 映射、输入、默认值、标识符引用、目标锁定、权限和执行流程；创建与替换复用 CREATE 定义，不按应用菜单复制或裁剪语法。

`*.snf.json` 在 Studio 根目录执行 `pnpm --filter @breeze/snf-oracle run init` 生成，不手工修改或提交。

维护检查使用 [SyntaxNF/parser](https://github.com/SyntaxNF/parser) 的 `bcf2c3ac58b45e7d5391716393586b00b11e0c1a` 提交及 `tsx` 4.23.5。先在 parser checkout 中按锁定依赖准备工具，再在本仓库显式运行以下命令；遵守 `AGENTS.md`，编辑后不自动运行测试或类型检查。

```sh
SNF_PARSER_ROOT=/absolute/path/to/parser node scripts/check-snf.mjs
SNF_PARSER_ROOT=/absolute/path/to/parser node --test tests/grammar-regressions.mjs
```

可用 `SNF_ROOT=/absolute/path/to/oracle-tree` 指定另一份待检查的定义树。
