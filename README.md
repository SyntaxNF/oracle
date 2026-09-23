# Oracle SNF

本仓库维护 `Oracle Database 19c` 对象操作语句的 `SNF`（Syntax Normal Form）定义。定义既用于阅读，也作为规范 SQL 的生成输入，因此需要准确表达分支、可选项、重复结构和语法节点的语义。定义以 Oracle SQL/PLSQL 语法为边界，独立于消费方的菜单和功能。当前语法覆盖仍在完善；不得为了 Studio 的某个操作而复制、裁剪定义或写死应用策略。

## 版本基线

本仓库以 [Oracle Database 19c SQL Language Reference](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/index.html) 和相关 [PL/SQL Packages and Types Reference](https://docs.oracle.com/en/database/oracle/oracle-database/19/arpls/index.html) 为语法基线，不混入其他版本的写法。每个 `.snf` 文件首行链接到对应的 Oracle 19c 官方文档页。

## 目录

- `create/`：创建数据库对象。
- `alter/`：修改数据库对象及其状态。
- `drop/`：删除数据库对象。
- `auth/`：授权与撤销授权。
- `other/`：注释、刷新和截断等操作。

## SNF 语法

### 基础记号

| 记号 | 含义 |
| --- | --- |
| `KEYWORD` | 需要原样生成的 SQL 关键字。 |
| `placeholder` | 需要由调用方提供或由其他语法节点展开的占位符。 |
| `[ syntax ]` | 整个 `syntax` 可选，最多出现一次。 |
| `{ a \| b }` | 必须从候选项中选择一个。 |
| `syntax [...]` | 前一个 `syntax` 可以继续重复，成员之间没有额外分隔符。 |
| `item [, ...]` | `item` 可重复，多个成员之间使用逗号分隔。 |
| `statement [; ...]` | `statement` 可重复，多个语句之间使用分号分隔。 |
| `( syntax )` | 需要原样生成的 SQL 圆括号。 |
| `'value'` | 需要原样生成的 SQL 字符串字面量。 |

省略号只用于 Oracle 语法确实允许重复的列表或语句序列。`[=]` 等紧凑写法表示对应符号本身可选。

### 定义指令

| 指令 | 含义 |
| --- | --- |
| `# CASE label` | 完整语法的顶层分支；同一文件有多个顶层语法时，每个分支都要标记。 |
| `# WHERE name` | 定义一个可复用语法节点；语法相同时可以用逗号同时声明多个名称。 |
| `# ONEOFIS name` | 定义单行候选集合；每个物理行是一个候选，语义等同于 `{ a \| b }`。 |
| `# PARTOFIS name` | 定义多行候选集合；每个空行分隔的 block 是一个候选。 |
| `# STATEMENT name` | 声明可嵌套的 statement 节点，不作为当前文件的顶层语法。 |

例如，`create/table.snf` 用 `# WHERE` 展开列定义：

```snf
CREATE TABLE name ( column_definition [, ...] )

# WHERE column_definition
colname data_type [ DEFAULT default_expression ] [ NOT NULL ]
```

## 书写与生成规则

- SQL 关键字及 PL/SQL 命名参数使用大写，语义占位符使用小写；文件名使用小写和连字符。
- 每个文件对应一种 SQL 语句或 PL/SQL 过程调用族，同一句法的变体使用 CASE。相互独立且最多出现一次的子句分别写为可选项；只有真正允许重复的结构才使用 `...`。
- `ONEOFIS` 的单个候选不能换行；候选需要跨行时使用 `PARTOFIS`。
- PL/SQL 定义包含完整单元内容，不附加 SQL*Plus 使用的 `/`。
- SNF 表达规范语句，不收录仅被解析器容忍、但不适合作为标准生成结果的写法。
- `*.snf.json` 由 Studio 根目录的 `pnpm --filter @breeze/snf-oracle run init` 生成，不手工修改或提交。

## 占位符命名

当前文件所定义主对象的名称统一使用 `name`；只有该主对象的重命名目标使用 `new_name`。其他对象使用类型或上下文名称，例如 `table`、`constraint`、`referenced_table`、`colname`。通用语义与同级 MySQL、PostgreSQL SNF 保持一致，Oracle 专属概念使用准确的领域名称。

### 语法节点后缀

| 后缀 | 适用语义 | 示例 |
| --- | --- | --- |
| `_statement` | 可独立执行或可完整嵌套的 SQL。 | `query_statement` |
| `_expression` | 产生值、布尔结果或关系的表达式。 | `default_expression` |
| `_definition` | 列、约束、分区或程序单元等结构的声明。 | `column_definition` |
| `_clause` | 带自身关键字、位置固定且不能独立执行的子句。 | `partition_clause` |
| `_option` | 一个可选设置或候选项。 | `table_option` |
| `_options` | 一组允许组合的设置。 | `identity_options` |
| `_action` | 依赖父语句、不能独立执行的操作片段。 | `on_delete_action` |
| `_value` | 不是任意 SQL 表达式的值或枚举。 | `attribute_value` |

标识符直接使用对象类型名，不为追求后缀形式而误标节点角色。`_expression` 用于可计算的 SQL 表达式，`_value` 用于受限的值或枚举；依赖父语句的操作不命名为 `_statement`。

### 常用占位符

| 占位符 | 含义 |
| --- | --- |
| `name` | 当前文件所定义主对象的名称。 |
| `new_name` | 当前主对象重命名后的名称。 |
| `table`、`schema`、`index`、`constraint`、`tablespace` | 非当前主对象的对应类型标识符。 |
| `colname` | 列名；多个列名仍通过 `colname [, ...]` 表达。 |
| `role`、`user` | 角色或用户标识符；是否可互换由具体语句决定。 |
| `data_type` | Oracle SQL 数据类型。 |
| `value` | 当前语法位置接受的原子值；若可接受一般 SQL 表达式，应使用 `_expression`。 |
| `query_statement` | 可作为查询来源或嵌套查询的完整查询语句。 |
| `column_definition` | 一个列的完整声明。 |

### Oracle 专属占位符

| 占位符 | 含义 |
| --- | --- |
| `object_definition` | 函数、过程、包或类型等程序单元的定义内容。 |
| `partition_clause`、`partition_definition` | 分区子句和单个分区定义。 |
| `referenced_schema`、`referenced_table`、`referenced_object` | 被引用对象的所有者和对象标识符。 |
| `job_type`、`job_action`、`repeat_interval` | `DBMS_SCHEDULER` 作业类型、动作和重复计划。 |
| `directory_path`、`file_name` | Oracle Directory 路径和数据文件名。 |

## Studio 集成

Studio 的 Oracle Registry 决定哪些操作可执行；SNF Pages 只提供语法定义。占位符由 SNF Editor 填写，Oracle Runner 负责标识符引用、目标锁定、参数、权限和语句边界校验。`create/`、`alter/`、`drop/`、`auth/`、`other/` 由 `snf/oracle` 包构建为独立的 Oracle SNF Pages。

### 语法与应用边界

同一 SQL 语句的变体使用 CASE；创建和替换复用 CREATE 定义。Scheduler 调用按过程定义，不能按任务/程序菜单复制。Studio 在操作注册表中映射定义路径和 CASE，负责默认值、允许范围、目标锁定、权限及执行流程；不得修改加载后的语法树来改变语句。
