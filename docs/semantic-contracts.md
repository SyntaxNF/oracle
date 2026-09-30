# Oracle 19c 消费方语义与输入约束

这些约束不能由 SNF 物理文档 parser 证明。本页列举已知高风险条件，不是 Oracle 全部语义规则的替代品。来源为各定义首行的对应 19c SQL/PLSQL 文档。

## 通用

- 标识符可表示限定对象名；引号、大小写和 schema/database-link 解析由消费方负责。占位符若已在 SNF 外层带引号，应提供正确转义的内容，避免二次引用
- data_type、expression、privilege、hint、访问驱动参数、Java 源码、ODCI 参数等叶子不是任意可信字符串；必须按所属语言与具体语法位置验证
- 重复选项不能重复设置同一单值属性或混入相互矛盾值；例如 LOGGING/NOLOGGING、ARCHIVELOG/NOARCHIVELOG、FORCE LOGGING/SET STANDBY LOGGING 等
- 对象类型、权限、容器、edition、COMPATIBLE/RU、ASM 实例、平台和许可决定语法是否可用。目录存在不是执行授权，语法也不代替安全策略
- 凭据/密钥只在语法中表示为占位符；不应写入源文件、测试 fixture、日志或覆盖清单

## 查询与 DML

- 递归 CTE 的递归成员必须恰好一次引用自身，列数与 anchor/alias 一致；禁止 DISTINCT/GROUP BY/MODEL、聚合（允许的分析函数除外）等官方限制；SEARCH/CYCLE 新列名必须有效且不冲突，cycle 标记为单字符字符串
- ORDER SIBLINGS BY 仅用于 CONNECT BY；FOR UPDATE 不可用于 DISTINCT/集合/聚合/分组查询，且遵守顶层限制；row limiting 与 FOR UPDATE 不可组合
- LATERAL 的相关引用、外连接/APPLY 与 PIVOT/UNPIVOT/MATCH_RECOGNIZE 的对象适用性仍须检查；本轮已在结构上隔离 LATERAL 后三者
- PIVOT/UNPIVOT 列组数量和类型匹配；MODEL 的维度/度量/迭代依赖、MATCH_RECOGNIZE 的变量、SUBSET、函数上下文和空匹配限制仍须验证
- RETURNING 不支持 remote/parallel DML 等场景；INSERT/MERGE 的列和值列表等长，MERGE 不更新 ON 引用列，视图与 collection 目标须可更新

## 表、索引与视图

- 分区/子分区方法必须与父表匹配，边界值类型/排序/唯一性、模板和维护目标必须合法；IOT/heap、压缩方式、LOB backend 的允许组合依赖对象元数据
- 临时表的 INVISIBLE/foreign-key 和 private temporary DEFAULT 已从对应结构排除；额外限制（命名前缀、类型、tablespace、CTAS 等）仍由消费方验证
- Bitmap 禁止 REVERSE/压缩，unique 禁止 PARTIAL，以及 NOSORT/REVERSE/分区/cluster 不相容组合已尽量按 CASE 分离；仍须验证 IOT 不接受 REVERSE/NOSORT、local unique 包含分区键、partial 需要分区表、bitmap join 的连接/约束条件
- 索引前缀长度、分区数、local/global 与 base table、域索引状态/ODCI、LOB SecureFile/BasicFile、tablespace segment-space 模式不能靠字符串结构判断
- Editioning view 只允许官方限定的单表直接列投影；不能把任意 SELECT 用作它的 query_statement。View key/FK 约束是 DISABLE NOVALIDATE 元数据约束
- 物化视图的 FAST/ON COMMIT/ON STATEMENT、refresh schedule、query rewrite 与底层查询/日志/权限兼容性须验证。USING INDEX 不允许 PCTFREE/PCTUSED
- MV log 的 record/augmentation 每种属性至多一次、至多一个列列表；COMMIT SCN 不可与 FOR SYNCHRONOUS REFRESH 混用，LOB master 等限制需元数据
- BIGFILE 恰好一个 datafile；temp/undo/system tablespace 允许操作不同。ASM diskgroup 操作必须在 ASM 环境执行；NORMAL/HIGH/FLEX 冗余与 failgroup 数量/站点符合环境要求

## PL/SQL

- 标识符/END 名、label、参数模式/默认值、类型锚点、声明顺序、重载、作用域、游标记录形状和异常处理（尤其 OTHERS 最后）仍须验证
- NOT NULL scalar/record field 必须初始化；SERIALLY_REUSABLE 仅包级且 spec/body 配对；AUTONOMOUS_TRANSACTION、INLINE、UDF、RESTRICT_REFERENCES 等 pragma 有各自作用域
- MAP 不含显式参数，返回可比较 scalar（非 LOB/BFILE）；ORDER 一个 IN 参数且 object_type 等于所属类型，返回 NUMBER 或其数值 subtype；MAP/ORDER 不得同时存在，至多一个
- Compound trigger 的 timing sections 不重复；noneditioning view 仅一个 INSTEAD OF EACH ROW section；compound 不允许自主事务。嵌套 declaration 的上下文仍须限制
- PRECEDES 只用于 reverse crossedition；FOLLOWS 用于普通/forward；CALL trigger 不允许 REFERENCING；trigger event、BEFORE/AFTER、schema/database/PDB、correlation/WHEN 的组合需进一步核对
- SELECT INTO 仅展开常用查询骨架；完整 SELECT、SQL 动态字符串、表达式、SQLJ/external call ABI 不是本仓库保证的完整语言

## 版本与资料差异

在线图示偶有括号/拼写/顺序缺漏，采用同版语义和官方示例交叉确认：例如 package/type-body 多方法分号连接、ALTER AUDIT POLICY ADD/DROP ONLY TOPLEVEL、ANALYZE TABLE VALIDATE STRUCTURE ONLINE，以及 PDB SNAPSHOT MODE。原始 19c 与后续 RU 特性不能仅凭 `/19/` URL 判定。
