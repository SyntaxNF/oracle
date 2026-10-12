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
| `[ { a \| b } ]` | 可选的显式枚举；`[ a \| b ]` 不合法 |
| `item [...]` | 重复前面的完整成员，次数为 0、1、2……，无额外分隔符 |
| `item [, ...]`、`statement [; ...]` | 重复完整成员，次数为 0、1、2……，分别用逗号、分号分隔 |
| `( syntax )`、`'value'` | 原样生成的 SQL 圆括号、字符串引号 |
| `# CASE label` | 完整语法的顶层分支 |
| `# WHERE name` | 可复用语法节点；相同语法可用逗号声明多个名称 |
| `# ONEOFIS name` | 每个物理行是一个候选 |
| `# PARTOFIS name` | 每个空行分隔的 block 是一个候选 |
| `# STATEMENT name` | 可嵌套的 statement 节点，不作为当前文件的顶层语法 |

未转义的 `|` 只能直接出现在 `{}` 内。

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

当前定义使用显式 OPTIONAL/ENUM 语法。先构建[SyntaxNF/parser](https://github.com/SyntaxNF/parser)，再在本仓库显式运行以下命令；遵守 `AGENTS.md`，编辑后不自动运行测试或类型检查。

```sh
(cd /absolute/path/to/parser && pnpm build)
export SNF_PARSER_WORKTREE_MODULE=/absolute/path/to/parser/dist/esm/index.mjs
npm run validate
npm test
```

可用 `SNF_ROOT=/absolute/path/to/oracle-tree` 指定另一份待检查的定义树。脚本只通过 `SNF_PARSER_WORKTREE_MODULE` 加载指定构建，标记为 `working-tree-build`；缺少该配置会直接报错。修改 parser 后应重新构建。

四库统一使用 `npm run validate` 执行全部结构检查、`npm test` 执行全部回归；`validate:snf` 为结构检查入口，`test:regression` 为回归入口。无需安装本库依赖，使用 Node.js 22 和上面明确指定的 parser 构建。

基础检查统一覆盖源文件与 AST 范围、显式 OPTIONAL/ENUM/GROUP、完整成员的 LOOP 绑定、冗余纯循环可选层、四空格缩进与末尾换行，对所有文件执行。生成回归覆盖 0/1/2 次循环、显式枚举、可选项、分隔符及自由输入原文保留。SQL Server 的 `validate` 还包含其指令/固定文本约定检查和生成结构检查；各库保留自己的方言回归。

`scripts/parser-runtime.mjs`、`scripts/snf-contract.mjs` 及其测试在四库保持一致；`generator-fixture.mjs` 仅本地文档加载入口不同，`generator-contract.test.mjs` 保持一致。修改公共契约时同步四库。报告的 `parserInput` 是实际加载路径；这些检查验证 SNF 和测试辅助生成行为，不执行数据库 SQL。


`SNFDocumentParser.parse()` 一次返回最终 AST：从 `document.entries` 获取入口，从 `document.definitions` 获取已编译定义；`blocks` 只保留源码。WHERE/ONEOFIS/PARTOFIS 引用已经展开，LOOP 直接包含完整成员和 `separator`，QUOTED 保留引号序列。递归引用的 `target` 已绑定到定义根 UID，STATEMENT 只保留名称与类别，不加载外部模板。

最终 AST 保留普通行内 BLANK（引号外归一为单空格），仅清理引号外 OPTIONAL / GROUP 首尾排版区域中不带 `indentLevel` 的 BLANK；换行、缩进锚点及引号内空白保留。生成器为实际输出内容的 OPTIONAL / GROUP 在左右提供空格，与已有水平空白合并，避免行首尾或换行旁多余空格；空分组、未选可选项和零次循环不产生间隔。其余节点按叶子 `content` 和保留的空白拼接，不推断标点连接；引号内不补分组间隔，自由输入文本原样保留。需要紧贴的前缀应纳入完整候选，如 `{ 'value' | N'value' }`、`@@GLOBAL.system_variable`，不要在前缀与正文之间设置 OPTIONAL / GROUP 边界。

所有最终节点自动带 `uid`，动态节点同时带 `name`；VARIABLE/REFERENCE/STATEMENT 取自身名称，OPTIONAL/ENUM/LOOP 使用大写功能名称，允许重名。消费方无需额外结构转换或 UID 分配。源节点通过 `sourceBlock` 和 `start/end` 指向定义或引用的实际来源。
