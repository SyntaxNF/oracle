# Oracle SyntaxNF

Oracle Database 19c 基线的 Studio 对象操作语法定义。每个文件对应一个受控操作；是否允许执行由 Oracle Runner 的 Registry、目标和权限决定。

`create`、`alter`、`drop`、`auth`、`other` 发布为独立 Oracle SNF Pages。占位变量由 SNF Editor 填写，Runner 负责标识符引用、目标锁定、参数和语句边界校验。PL/SQL 定义包含完整单元内容，不附 SQL*Plus 的 `/`。

`*.snf.json` 由 Studio 的 `pnpm --filter @breeze/snf-oracle run init` 生成，勿手改。
