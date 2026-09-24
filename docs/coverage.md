# SQL 定义覆盖检查

基线：[Oracle Database 19c SQL Language Reference](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/toc.htm)。检查日期：2026-09-24。

## 结论

**尚未全量覆盖 Oracle 19c。** 本轮由 63 个定义文件扩展到 91 个，补充通用查询、DML、事务、会话及常用对象语法。文件数量包含 PL/SQL 包调用，不能等同于官方 SQL 命令数量。

## 本轮补充

- 查询与 DML：SELECT、INSERT（单表/多表/条件插入）、UPDATE、DELETE、MERGE；支持 CTE、连接、层次查询、集合操作、分页、行锁、RETURNING 与错误日志等常用结构。
- 事务：COMMIT、ROLLBACK、SAVEPOINT、SET TRANSACTION、SET CONSTRAINTS、LOCK TABLE。
- 会话与维护：ALTER SESSION、SET ROLE、EXPLAIN PLAN、CALL、RENAME、PURGE、FLASHBACK TABLE、TRUNCATE CLUSTER。
- 对象：新增 context、restore point、schema、PFILE/SPFILE 的创建及相关删除，补 ALTER SYNONYM/DATABASE LINK。
- 扩展 CREATE TABLE 的约束、identity、虚拟列、私有临时表和 CTAS；ALTER TABLE 增加多列、unused、identity 删除、可见性、行移动。
- 扩展索引、视图、序列、用户、角色、profile、数据库链接、同义词、授权/撤权和 DROP 选项。
- Studio 包的 Pages 构建目录加入 query/transaction；消费方权限与操作注册表仍独立维护。

## 已存在定义中的剩余缺口

- CREATE/ALTER TABLE 的复杂分区、存储、压缩、LOB、对象表/XMLType 等分支未穷尽；partition_clause、partition_definition、split_clause 仍是输入片段。
- SELECT 的 MODEL 仍是输入片段；PIVOT/UNPIVOT、MATCH_RECOGNIZE、分析视图、WITH 内 PL/SQL 声明等未结构化展开。
- 函数、过程、包、类型和触发器的程序体仍保留 object_definition/trigger_definition，不表示完整 PL/SQL 文法。
- Domain/bitmap join/复杂分区索引，object/XMLType view、高级物化视图、完整表空间管理等仍需逐项扩展。
- Oracle 在线 19c 手册含后续 RU 增补。本轮没有统一加入依赖特定 RU 的 IF [NOT] EXISTS 等写法；使用这类功能前需要明确最低 RU。
- 表达式、提示、权限名和参数值等叶子内容，以及不同对象/约束组合的语义限制，仍需调用方和数据库校验。

## 官方目录中仍缺少的语句入口

以下按 SQL 命令页与定义首行 URL 对照，排除了函数页。它们是后续工作清单，不应使用仅含自由文本的空壳定义来宣称已覆盖。

- [ADMINISTER KEY MANAGEMENT](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ADMINISTER-KEY-MANAGEMENT.html)
- [ALTER ANALYTIC VIEW](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-ANALYTIC-VIEW.html)
- [ALTER ATTRIBUTE DIMENSION](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-ATTRIBUTE-DIMENSION.html)
- [ALTER CLUSTER](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-CLUSTER.html)
- [ALTER DATABASE DICTIONARY](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-DATABASE-DICTIONARY.html)
- [ALTER DATABASE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-DATABASE.html)
- [ALTER DIMENSION](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-DIMENSION.html)
- [ALTER DISKGROUP](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-DISKGROUP.html)
- [ALTER FLASHBACK ARCHIVE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-FLASHBACK-ARCHIVE.html)
- [ALTER HIERARCHY](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-HIERARCHY.html)
- [ALTER INDEXTYPE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-INDEXTYPE.html)
- [ALTER INMEMORY JOIN GROUP](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-INMEMORY-JOIN-GROUP.html)
- [ALTER JAVA](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-JAVA.html)
- [ALTER LIBRARY](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-LIBRARY.html)
- [ALTER LOCKDOWN PROFILE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-LOCKDOWN-PROFILE.html)
- [ALTER MATERIALIZED ZONEMAP](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-MATERIALIZED-ZONEMAP.html)
- [ALTER OPERATOR](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-OPERATOR.html)
- [ALTER OUTLINE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-OUTLINE.html)
- [ALTER PLUGGABLE DATABASE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-PLUGGABLE-DATABASE.html)
- [ALTER RESOURCE COST](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-RESOURCE-COST.html)
- [ALTER ROLLBACK SEGMENT](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-ROLLBACK-SEGMENT.html)
- [ALTER SYSTEM](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-SYSTEM.html)
- [ALTER TABLESPACE SET](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-TABLESPACE-SET.html)
- [ANALYZE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ANALYZE.html)
- [ASSOCIATE STATISTICS](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ASSOCIATE-STATISTICS.html)
- [CREATE ANALYTIC VIEW](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-ANALYTIC-VIEW.html)
- [CREATE ATTRIBUTE DIMENSION](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-ATTRIBUTE-DIMENSION.html)
- [CREATE CLUSTER](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-CLUSTER.html)
- [CREATE CONTROLFILE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-CONTROLFILE.html)
- [CREATE DATABASE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-DATABASE.html)
- [CREATE DIMENSION](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-DIMENSION.html)
- [CREATE DISKGROUP](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-DISKGROUP.html)
- [CREATE FLASHBACK ARCHIVE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-FLASHBACK-ARCHIVE.html)
- [CREATE HIERARCHY](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-HIERARCHY.html)
- [CREATE INDEXTYPE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-INDEXTYPE.html)
- [CREATE INMEMORY JOIN GROUP](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-INMEMORY-JOIN-GROUP.html)
- [CREATE JAVA](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-JAVA.html)
- [CREATE LIBRARY](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-LIBRARY.html)
- [CREATE LOCKDOWN PROFILE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-LOCKDOWN-PROFILE.html)
- [CREATE MATERIALIZED ZONEMAP](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-MATERIALIZED-ZONEMAP.html)
- [CREATE OPERATOR](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-OPERATOR.html)
- [CREATE OUTLINE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-OUTLINE.html)
- [CREATE PLUGGABLE DATABASE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-PLUGGABLE-DATABASE.html)
- [CREATE ROLLBACK SEGMENT](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-ROLLBACK-SEGMENT.html)
- [CREATE TABLESPACE SET](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-TABLESPACE-SET.html)
- [DISASSOCIATE STATISTICS](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/DISASSOCIATE-STATISTICS.html)
- [DROP ANALYTIC VIEW](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/DROP-ANALYTIC-VIEW.html)
- [DROP ATTRIBUTE DIMENSION](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/DROP-ATTRIBUTE-DIMENSION.html)
- [DROP CLUSTER](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/DROP-CLUSTER.html)
- [DROP DATABASE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/DROP-DATABASE.html)
- [DROP DIMENSION](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/DROP-DIMENSION.html)
- [DROP DISKGROUP](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/DROP-DISKGROUP.html)
- [DROP FLASHBACK ARCHIVE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/DROP-FLASHBACK-ARCHIVE.html)
- [DROP HIERARCHY](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/DROP-HIERARCHY.html)
- [DROP INDEXTYPE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/DROP-INDEXTYPE.html)
- [DROP INMEMORY JOIN GROUP](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/DROP-INMEMORY-JOIN-GROUP.html)
- [DROP JAVA](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/DROP-JAVA.html)
- [DROP LIBRARY](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/DROP-LIBRARY.html)
- [DROP LOCKDOWN PROFILE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/DROP-LOCKDOWN-PROFILE.html)
- [DROP MATERIALIZED ZONEMAP](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/DROP-MATERIALIZED-ZONEMAP.html)
- [DROP OPERATOR](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/DROP-OPERATOR.html)
- [DROP OUTLINE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/DROP-OUTLINE.html)
- [DROP PLUGGABLE DATABASE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/DROP-PLUGGABLE-DATABASE.html)
- [DROP ROLLBACK SEGMENT](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/DROP-ROLLBACK-SEGMENT.html)
- [DROP TABLESPACE SET](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/DROP-TABLESPACE-SET.html)
- [FLASHBACK DATABASE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/FLASHBACK-DATABASE.html)

## 验证范围

本轮只进行官方语法图文本对照和静态检查；未运行解析测试、类型检查、构建或数据库执行验证，未生成 .snf.json。SNF 不执行数据库操作。
