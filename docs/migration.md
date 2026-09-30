# 消费方迁移清单

本轮按语法分支拆 CASE，消费方的路径、CASE allowlist、参数映射与默认值需同步。本仓库未改 Studio Registry/Pages 或消费方实现，也没有证明这些集成已兼容。

## 已移除或由单入口改多 CASE

### `alter/materialized-view-log.snf`

原 CASE：无 CASE 的单一入口

新增可选分支：`ADD`, `ALLOCATE_EXTENT`, `CACHE`, `LOGGING`, `MOVE`, `NEW_VALUES`, `PARALLEL`, `PHYSICAL_ATTRIBUTES`, `PURGE`, `REFRESH_TYPE`, `SHRINK`

### `alter/table.snf`

原 CASE：`PARTITION_ADD`, `PARTITION_SPLIT`, `SUBPARTITION_ADD`, `SUBPARTITION_SPLIT`

新增可选分支：`ALLOCATE_EXTENT`, `DEALLOCATE_UNUSED`, `LOB_MODIFY`, `LOB_MOVE`, `MODIFY_NONPARTITIONED`, `MODIFY_PARTITIONING`, `PARTITION_ADD_HASH`, `PARTITION_ADD_LIST`, `PARTITION_ADD_RANGE`, `PARTITION_ADD_SYSTEM`, `PARTITION_COALESCE`, `PARTITION_DEFAULT_ATTRIBUTES`, `PARTITION_LIST_ADD_VALUES`, `PARTITION_LIST_DROP_VALUES`, `PARTITION_MODIFY`, `PARTITION_MOVE`, `PARTITION_RENAME`, `PARTITION_SPLIT_LIST`, `PARTITION_SPLIT_MULTIPLE_LIST`, `PARTITION_SPLIT_MULTIPLE_RANGE`, `PARTITION_SPLIT_RANGE`, `PARTITION_STORE_IN`, `SET_AUTOMATIC_PARTITIONING`, `SET_INTERVAL`, `SET_SUBPARTITION_TEMPLATE`, `SHRINK`, `SUBPARTITION_ADD_HASH`, `SUBPARTITION_ADD_LIST`, `SUBPARTITION_ADD_RANGE`, `SUBPARTITION_COALESCE`, `SUBPARTITION_LIST_ADD_VALUES`, `SUBPARTITION_LIST_DROP_VALUES`, `SUBPARTITION_MODIFY`, `SUBPARTITION_MOVE`, `SUBPARTITION_RENAME`, `SUBPARTITION_SPLIT_LIST`, `SUBPARTITION_SPLIT_RANGE`

### `create/function.snf`

原 CASE：无 CASE 的单一入口

新增可选分支：`AGGREGATE`, `CALL_SPECIFICATION`, `PIPELINED_INTERFACE`, `PIPELINED_PLSQL`, `PLSQL`, `POLYMORPHIC`

### `create/materialized-view.snf`

原 CASE：无 CASE 的单一入口

新增可选分支：`HEAP`, `INDEX_ORGANIZED`, `PREBUILT`

### `create/package-body.snf`

原 CASE：无 CASE 的单一入口

新增可选分支：`BODY`

### `create/package.snf`

原 CASE：无 CASE 的单一入口

新增可选分支：`SPECIFICATION`

### `create/procedure.snf`

原 CASE：无 CASE 的单一入口

新增可选分支：`CALL_SPECIFICATION`, `PLSQL`

### `create/tablespace.snf`

原 CASE：无 CASE 的单一入口

新增可选分支：`LOCAL_TEMPORARY`, `PERMANENT`, `TEMPORARY`, `UNDO`

### `create/trigger.snf`

原 CASE：无 CASE 的单一入口

新增可选分支：`COMPOUND_DML_FORWARD`, `COMPOUND_DML_NORMAL`, `COMPOUND_DML_REVERSE`, `COMPOUND_NONEDITIONING_VIEW`, `DATABASE_ROLE_CHANGE`, `DATABASE_SHUTDOWN`, `DATABASE_STARTUP`, `INSTEAD_OF_CREATE`, `INSTEAD_OF_DML`, `INSTEAD_OF_DML_CALL`, `PDB_CLONE`, `PDB_UNPLUG`, `ROW_DML_FORWARD`, `ROW_DML_FORWARD_CALL`, `ROW_DML_NORMAL`, `ROW_DML_NORMAL_CALL`, `ROW_DML_REVERSE`, `ROW_DML_REVERSE_CALL`, `SESSION_AFTER`, `SESSION_LOGOFF`, `SET_CONTAINER`, `STATEMENT_DML`, `STATEMENT_DML_CALL`, `SYSTEM_DDL`

### `create/type-body.snf`

原 CASE：无 CASE 的单一入口

新增可选分支：`BODY`

### `create/type.snf`

原 CASE：无 CASE 的单一入口

新增可选分支：`INCOMPLETE`, `NESTED_TABLE`, `OBJECT`, `SUBTYPE`, `VARRAY`

### `create/view.snf`

原 CASE：无 CASE 的单一入口

新增可选分支：`EDITIONING`, `OBJECT`, `RELATIONAL`, `XMLTYPE`

## 参数与输入语义

- 原 INDEX_PARTITION 的 `INDNAME => index` 修正继续保留；table/index 的 name/分区 name 语义不变
- 统计信息不再固定 FORCE=>FALSE；默认省略 FORCE 时仍由 Oracle 默认 FALSE 决定。消费方如只允许 false，需要在其 allowlist/默认值里限定，不修改 SNF
- `create/directory.snf` 的路径现在有显式 SQL 单引号；消费方应提供转义后的路径内容，不再叠加已有引号
- CALL 的 output/indicator 现在显式 `:`，对应占位符为 host_variable/indicator_variable；不能继续把冒号重复传入
- 原自由文本 object_definition/trigger_definition/partition_clause/split_clause 被结构化节点取代；先使用新节点构建输入，不应把旧整段文本塞进单个叶子
- 表/索引维护 CASE 分拆为 RANGE/LIST/HASH/MULTIPLE 等，选择前必须了解对象分区方法；UNIQUE/BITMAP/临时表/触发器作用域也必须选择正确 CASE
- 新 helper、OPTIONAL 和 LOOP 不赋予调用方执行权限；涉及审计、密钥、系统/数据库/ASM 的操作必须单独制定消费方安全策略
