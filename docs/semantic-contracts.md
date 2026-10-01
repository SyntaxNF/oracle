# 输入与生成边界

本仓库提供 Oracle 19c 的规范 SQL 生成模板，不实现 Oracle 语义校验器，也不要求接入方另造一套完整的 Oracle 上下文校验器。数据库的类型、对象状态、权限、版本和跨子句合法性不由 SNF 证明。

## 生成契约

- `item [...]` / `item [, ...]` 的 LOOP 包含前面的整个成员，次数为 **0、1、2……**，没有额外必选的首项。纯 `[ item [...] ]` 外壳没有必要
- 带关键字或字面括号的可选项仍有意义，例如 `[ DECLARE declaration_definition [...] ]`、`[ USING argument [, ...] ]`、`[ ( parameter_definition [, ...] ) ]`，不能只因内部有 LOOP 就去掉外壳
- 每个重复成员必须带齐自己的前缀、引号、括号和后缀；文件名使用 `quoted_file_name`，多列表分区使用 `list_partition_values`，ARRAY DML 使用 `array_dml_type_definition`
- 独立、单次的属性按固定顺序排列为可选项，不用可重复的选项袋表达；真正的列、参数、文件、分区、声明和语句列表保留 LOOP
- 消费方既有生成约定会清理圆括号内最后一个逗号，因此相邻可空列表可以让完整成员带尾逗号。不通过组合 CASE 或“至少一项”结构补丁模拟 SQL 合法性
- 0 次展开是模板行为，不宣称每个空列表都能由 Oracle 执行；未填写必要输入也不构成一个已经完成的 SQL 请求

## 输入形状和转义

- 标识符叶子保留相应对象名或限定名输入；不要把表名、列名等二次转成另一个语法节点
- SNF 已包含单引号时，传入其内部正确转义的内容。例如 `quoted_file_name` 展开为 `'file_name'`，输入不再含外围引号。测试中的示例文件名不含真实凭据
- `CALL` 的 host/indicator 变量冒号由模板输出，叶子不再重复传入 `:`
- `query_statement` 可复用 SELECT 定义；表达式、Java/C 外部内容和未展开的领域语言保留为自由输入，不因此增加另一套表达式解析器
- `declaration_definition`、`package_data_definition`、`plsql_statement` 是完整自由片段，自带各自的分号；`exception_handler` 包含完整 `WHEN ... THEN ...` 及其内部语句分号。模板生成外层 `BEGIN`、`EXCEPTION`、`END [name] ;`，不为自由片段再补分号
- 已有声明/语句 AST 输入需要转换成上述完整片段；程序单元的外层参数、权限选项、call specification 和明确的结构分支仍可逐项填写

## 范围

UNIQUE/BITMAP、临时表、触发器 edition/order/body 等复用共同的语法节点，不再复制 CASE/声明目录来编码所有组合限制。保留语法选择不表示每种组合都适用于每个对象。

数据库执行、安全策略和敏感输入处理属于实际执行流程。凭据、密钥不得写进定义、测试样例或日志。文件存在不代表任何执行授权；本轮没有运行数据库，也没有改消费方的权限或执行策略。
