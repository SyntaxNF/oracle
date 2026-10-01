# 生成模板验证与复现

本轮检查获得用户授权；没有修改 AGENTS.md 的后续默认规则。以下检查仅验证 SNF 文档、实际 parser AST 和小型生成契约 fixture，不是 Oracle SQL 语义校验或下游生成器的端到端测试。

## 固定实际 parser

- 仓库：`SyntaxNF/parser`
- 提交：`bcf2c3ac58b45e7d5391716393586b00b11e0c1a`
- `snf-parser`：0.1.0；运行时工具 `tsx`：4.23.5
- `scripts/parser-runtime.mjs` 检查 checkout 的提交、src/依赖清单工作区状态，并把磁盘源文件逐个对照 Git blob；随后直接加载 `src/index.ts`，不信任已有 dist bundle
- 不新增运行时依赖，不自动安装工具，不生成 `.snf.json`

## 复现命令

准备上述提交的 parser checkout，并按其锁定依赖安装好工具后，在本仓库运行：

```sh
SNF_PARSER_ROOT=/absolute/path/to/parser node scripts/check-snf.mjs
SNF_PARSER_ROOT=/absolute/path/to/parser node --test tests/grammar-regressions.mjs
git diff --check
```

parser 自身的基础检查：

```sh
cd /absolute/path/to/parser
node --import tsx test/index.ts
```

`SNF_ROOT=/absolute/path/to/another/oracle-tree` 可选地指定待验证定义树；校验器/fixture 仍来自当前版本。这使旧审查版的回归对照无需改动 parser 或当前定义。

## 检查内容

- 全量文件的实际 parser 解析、文档/物理行往返和原始 AST raw/span 一致性
- Oracle 19c 首行来源、路径与 CASE/helper/占位符命名、重复 helper/CASE、ONEOFIS 物理行、行尾空白
- `exchangeLoopNode` 后每个重复标记有完整绑定成员；纯 OPTIONAL→LOOP 外壳被识别，带关键字和字面括号的可选项保留
- 0/1/2 次重复：带引号值、文件名、ARRAY DML/分区元组、PIVOT ANY、editioning-view 列、operator/compiler assignment、DML/trigger 和自由 PL/SQL 片段
- 对象类型 attributes/methods 的 0/1/2 × 0/1/2 组合、多分区 SPLIT 尾逗号所有权；参数括号、DECLARE、EXCEPTION 等完整可选段
- 固定顺序独立属性和组合输入，包括 shared/local temporary tablespaces 与重复 QUOTA；不强制非空输入，不建立 UNIQUE/BITMAP/pragma 等语义矩阵
- 164 文件及 161 官方命令映射的完整性

## Fixture 的限制

`generator-fixture.mjs` 是一个小型解释器，仅展示约定的 AST 选择、变量输入、LOOP 次数、词分隔和圆括号尾逗号清理。期望文本使用独立常量/输入计算，不用待测渲染结果构造自身期望。

它不是实际下游 SQL 生成器；字符串处理只服务于这些测试样例，不是完整的 Oracle 引号、注释或词法实现。测试中的空列表或组合结果是模板契约，不表示该 SQL 能在任意 Oracle 对象/上下文中执行。完整表达式、类型/名字绑定、对象状态、权限、pragma 作用域等不在本轮验证范围。

## 本轮结果

- 全量 **164/164** 文件通过：1,665 blocks、489 CASE、654 helper declarations、50,601 原始 AST nodes、627 个已绑定 LOOP；错误为 0
- **355/355** 测试通过，其中包含 164 个逐文件检查和 191 个生成/结构契约测试
- parser 自身基础测试通过；`git diff --check` 通过
- 对照不可变旧审查提交 `780e373fba2ab9d26abaf235620aa6bd9496f1f1`：同一校验器发现 40 个游离重复标记和 115 个纯 LOOP 可选外壳；13 个选定重点回归在旧版均按预期失败，当前通过
- 独立静态审阅覆盖重构后的语法、固定顺序属性、生成 fixture 和实际 parser 加载；发现的 CACHE 选择分组、shared/local temporary tablespace 组合问题已修复并复核

未执行 Oracle SQL、真实对象编译、Studio Registry/Pages 构建或消费方端到端验证；不以 parser/fixture 通过替代实库结果。GitHub exact-head 检查状态在发布时另行核实；没有配置的检查不能称作 CI 通过。
