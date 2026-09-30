# 验证与复现

这轮检查得到用户明确授权。默认仍遵守 AGENTS.md：不在后续编辑后擅自运行测试或类型检查。

## 使用的 parser

- `SyntaxNF/parser` 本地 checkout commit：`bcf2c3ac58b45e7d5391716393586b00b11e0c1a`
- 包版本：`snf-parser` 0.1.0，ESM `SNFDocumentParser`
- 定义仓库没有应用构建或独立 typecheck 配置；检查脚本通过参数接受现有 parser ESM 入口，不增加运行时依赖

## 命令

```sh
node scripts/check-snf.mjs /path/to/snf-parser/dist/esm/index.mjs
node tests/grammar-regressions.mjs /path/to/snf-parser/dist/esm/index.mjs
git diff --check
```

在 parser 仓库运行其基础测试：

```sh
node --import tsx test/index.ts
```

本环境 pnpm 自动依赖检查尝试写不存在的默认缓存路径失败，tsx CLI 的 IPC socket 也被环境禁止；使用已安装 tsx 的 Node import 入口成功执行基础测试，未安装额外依赖。

## 实际检查范围

1. 全量 164 个 SNF 文档由真实 parser 读取；保留完整文档、物理行与 AST raw/span 一致性
2. 官方 19c 首行链接、CASE/helper 命名和重复定义、ONEOFIS 每个物理行独立可解析，以及行尾空白
3. 36 个回归断言：主要新增 helper 存在、LATERAL 隔离、MODEL literal 方括号、ANCILLARY/编译参数完整重复、临时表限制、bitmap/unique 索引属性、ALTER INDEX PCTFREE、trigger/call/pragma、PROFILE 非空、INDEX_PARTITION 参数和161项覆盖清单
4. Parser 自身基础测试通过
5. 全部文件最终 diff/目录映射与来源人工核对，发现并修复的结构问题已纳入回归断言

这些是 SNF 文档与部分结构语义的检查，不是 SQL round-trip、Oracle 执行测试、完整语义证明或 Studio Registry/Pages 构建。没有运行数据库命令，也没有生成 `.snf.json`。
