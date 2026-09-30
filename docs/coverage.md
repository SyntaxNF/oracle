# Oracle 19c 语法覆盖与验证

基线：[Oracle Database 19c SQL Language Reference](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/toc.htm)；PL/SQL 使用同版 [Language Reference](https://docs.oracle.com/en/database/oracle/oracle-database/19/lnpls/index.html)。核对日期：2026-09-30。起点是已合并统计信息修正的 `8f1aec6949b5f6757f6d600f13d0579b42ae2cc7`。

## 结论与计数口径

**官方目录的 161 个 SQL 命令页均有定义入口，但不等于完整 Oracle 19c 文法，更不等于 SQL 已在 Oracle 上执行验证。**

- 仓库从 92 个增加到 **164 个 `.snf` 文件**，新增 72 个文件
- 原有定义可映射到 88 个官方命令页，本轮补齐另外 73 个命令页的入口
- Traditional/Unified AUDIT 分别合并在 `auth/audit.snf` 的 CASE 中，NOAUDIT 同理；这两处各自对应两个官方页面
- `DROP PACKAGE BODY` 与 `DROP PACKAGE` 共用官方页面，但保留已有两个定义文件
- 另有匿名 PL/SQL block 与 DBMS_STATS、DBMS_SCHEDULER、DBMS_MVIEW 三个过程调用族，不能混入 SQL 命令页计数
- [逐命令清单](statement-inventory.json) 逐项列出官方来源、定义文件、原有/新增入口、已建模范围及剩余内容；当前为 **108 项 structured、53 项 partial**。structured 只说明所列语句级结构已建模，不是完整性或数据库语义保证

## 本轮实质扩展

### 查询与 DML

SELECT 不再把 MODEL 当整段输入：展开 reference/main model、维度/度量、规则、cell assignment、单列/多列 FOR 与迭代；增加 PIVOT/XML PIVOT、UNPIVOT、MATCH_RECOGNIZE 的模式/量词/PERMUTE/排除/SUBSET/DEFINE 结构。补递归 CTE 的 SEARCH/CYCLE、集合操作链、分层查询两种顺序、LATERAL/APPLY、采样与 flashback。

LATERAL 分支与不允许附着的 PIVOT/UNPIVOT/MATCH_RECOGNIZE 分离。MERGE 支持 update-first 和 insert-first；多表 INSERT 使用独立目标定义，避免错误允许 alias/remote/collection 目标。五种 DML 都保留 hint 入口。

### 表、索引、视图与存储

CREATE/ALTER TABLE 的 range/list/hash/interval/automatic/composite/reference/system 分区、subpartition/template、维护/交换/移动等已结构化，增加 LOB、STORAGE、压缩与默认属性。临时/私有临时表使用专用列和约束节点。

索引增加 local/global range/hash、bitmap join、domain 结构；区分普通/unique/bitmap 的属性，排除已知 bitmap REVERSE/压缩、unique PARTIAL 等非法组合；ALTER INDEX 通用属性不再允许 PCTFREE。

扩展 object/XMLType/editioning view、物化视图及日志、permanent/temporary/local temporary/undo tablespace。物化视图刷新与调度、query rewrite、evaluation edition、日志 purge/augmentation 等都有具体节点。

### 程序单元与 PL/SQL

函数、过程、包、包体、类型、类型体和触发器不再仅为 `object_definition`/`trigger_definition` 空壳。展开参数、权限/edition/accessible-by、声明、局部子程序、Java/C call spec、聚合/pipeline/PTF、对象/集合类型和方法。

新增匿名 block；覆盖赋值、IF/CASE/循环、异常、游标、SELECT INTO、FORALL、动态 SQL 等核心控制流。触发器按常规/正向/反向 crossedition、block/CALL、compound table/view、系统事件拆分；修正 PRECEDES、REFERENCING 与 compound INSTEAD OF 的适用范围。NOT NULL 变量要求初始化；SERIALLY_REUSABLE 保留在包级声明；MAP/ORDER 签名分别建模。

### 新增语句家族

包含 analytic view/attribute dimension/hierarchy/dimension/zone map、cluster、indextype/operator/library/Java、flashback archive/inmemory join group/outline/rollback segment、audit policy/AUDIT/NOAUDIT、ANALYZE/ASSOCIATE/DISASSOCIATE STATISTICS、database/controlfile/PDB/tablespace set、ASM diskgroup、ALTER SYSTEM、key management 等。每项入口都含实际分支/子句，未用整句自由文本凑覆盖数量。

### 原有浅定义补强

编译类 ALTER 增加 DEBUG、编译参数、REUSE SETTINGS 和 editioning；ALTER TYPE 增加属性/方法/集合演进，ALTER USER 增加 authentication/container-data/proxy 等。PROFILE 与 ALTER SEQUENCE 要求至少一个操作，避免全可选结构生成空操作。COMMENT 补充对象类型，CALL 展开调用参数和 host-variable 形式，Directory 增加 SHARING。

DBMS_STATS 四个原 CASE 保留，新增两个采集过程的命名参数结构；FORCE 不再写死 FALSE，省略时仍使用 Oracle 的默认值。Scheduler/MVIEW 调用做展示换行，不宣称覆盖全部包 API。

## 已知 partial 与排除范围

完整的逐命令说明见 [statement-inventory.json](statement-inventory.json)，主要缺口如下：

- SELECT：WITH 局部 PL/SQL/inline analytic views、partitioned outer joins、inline/modified external table；完整 SQL 表达式、函数与 hint 目录
- TABLE/INDEX：对象/XMLType/collection 存储、hybrid external/sharding partition sets、ILM/In-Memory/clustering，完整 dependent-table/filter/UPDATE INDEXES 子句；XMLIndex/ODCI/access-driver mini-language
- 物化视图/日志：OF object/scoped REF/encrypted column、partition/LOB/nested/varray/In-Memory 等高级组合
- attribute dimension：snowflake 多来源/JOIN PATH；analytic view 的全套分析表达式；zone map 旧式 `(+)` 连接和创建时列 alias 列表
- PL/SQL：conditional compilation、SQLJ 映射、无属性 NOT INSTANTIABLE 类型、部分构造方法/call-spec 属性、全部 legacy EXTERNAL 选项；表达式、名字/类型绑定、声明顺序和 pragma scope 不是完全语义文法
- DATABASE/PDB：完整 Data Guard/高级恢复/CDB fleet/property、CONTAINER_MAP、XML 解密和高级 keystore rekey；TABLESPACE SET 的完整 DEFAULT/ILM/In-Memory/storage
- ASM：ADVM volume、filegroup/quotagroup、用户/组/文件 ACL/ownership、scrub/redundancy conversion；key management 的显式 MKID:MK 等 provider-specific 扩展
- 不纳入未经最低 RU 固定的 IF [NOT] EXISTS（官方注明 19.28+）、annotations、SQL_MACRO、blockchain/immutable table 等增补；在线 19c 手册会更新，链接位于 `/19/` 不代表该选项适用于全部 19c RU
- 不穷尽 DBMS_* 包、所有内建函数或 SQL*Plus/RMAN/ASMCMD 等客户端语言

## 验证边界

用户已明确批准本轮运行 parser 和相关校验；不改变 `AGENTS.md` 的默认禁止自动测试规则。

- 全部 `.snf` 使用真实 `SNFDocumentParser` 解析；检查文档逐行往返、AST raw/span、首行 Oracle 19c 来源、CASE/helper 重名和 ONEOFIS 物理行边界
- 36 条仓库回归断言覆盖本轮已修正的结构约束与目录/文件映射，见 [验证说明](validation.md)
- snf-parser 自身基础测试通过；这些测试不代表 Oracle 数据库接受所生成 SQL
- 独立静态审阅覆盖查询、程序单元、表/索引、分析对象及管理定义，并按 Oracle 19c 来源修正发现的问题
- 没有运行 Oracle 实例、DDL/DML、真实对象编译、生产操作、Studio Pages 构建或消费方端到端验证；没有生成或提交 `.snf.json`

## 消费方必须保留的校验

SNF 的 CASE/WHERE/ONEOFIS/PARTOFIS/STATEMENT 是文档约定；parser 保留并解析 block，不负责跨文件解析、Oracle 类型检查或权限判断。消费方必须遵守 [语义与输入约束](semantic-contracts.md)，尤其是递归 CTE、FOR UPDATE/RETURNING、临时表、索引种类、分区匹配、触发器作用域及存储环境限制。

本轮包含 CASE 拆分与占位符调整，参见 [迁移清单](migration.md)。先更新消费方映射、allowlist 与输入验证，再启用新增操作。
