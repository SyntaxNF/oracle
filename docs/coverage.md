# Oracle 19c 生成模板覆盖

基线为 [Oracle Database 19c SQL Language Reference](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/toc.htm) 和同版 [PL/SQL Language Reference](https://docs.oracle.com/en/database/oracle/oracle-database/19/lnpls/index.html)。目录入口核对继承 2026-09-30 的清单；本轮于 2026-10-01 按生成器范围复审。

## 覆盖与取舍

- 保留上轮补齐的 **164 个 SNF 文件**，较审查前 92 个增加 72 个
- [逐命令清单](statement-inventory.json) 保留全部 **161 个官方 SQL 命令页**的文件映射；原有 88 个命令入口，新增 73 个
- AUDIT/NOAUDIT 的传统/统一模式分别共用文件；PACKAGE BODY 与 PACKAGE 共用官方页面。匿名 PL/SQL block、DBMS_STATS/DBMS_SCHEDULER/DBMS_MVIEW 不重复计入 SQL 命令页
- 清单中的 structured 仅表示列出的语句级结构已经建模，partial 表示仍有已知分支或领域语言缺口；均不表示完整语法或实库验证

保留查询的 MODEL、PIVOT/UNPIVOT、MATCH_RECOGNIZE、SEARCH/CYCLE，表/索引的分区与存储，物化视图、程序单元以及新增的分析、审计、数据库/PDB、ASM/system/key-management 等语句入口。未用删除新文件的方式缩小审查范围。

## 本轮必要修正

1. 完整成员重复：修复带引号的文件名、tablespace/instance/feature/key 等值，列表分区元组、ARRAY DML 元组和 PIVOT ANY 的 LOOP 绑定；每次展开保留完整成员
2. 零成员与标点：对象类型 attributes/methods 和多分区 SPLIT 的相邻可空成员不再留下前导逗号；移除纯 LOOP 的冗余可选外壳，保留带关键字/括号的整段可选项
3. 规范属性顺序：STORAGE、physical/index attributes、profile、sequence 等独立单次属性改成固定顺序可选项；保留真正的列表和序列
4. 索引复用：TABLE 使用 UNIQUE/BITMAP 和 local/global partition 选项，共用属性；CLUSTER、BITMAP_JOIN、DOMAIN 保留结构差异，不复制合法组合矩阵
5. 程序单元收敛：保留外层签名、选项、Java/C call specification 与 BEGIN/EXCEPTION/END 骨架；声明、语句和异常处理体为完整自由片段。触发器按结构族组织，不按 pragma、edition 或 body/CALL 的笛卡尔积复制定义
6. 保留已有真实修正：MODEL 的字面方括号转义、完整 ancillary operator binding、编译参数 assignment、Directory 引号、CALL 冒号、DML hint、DBMS_STATS 参数等

输入和分号契约见 [输入与生成边界](semantic-contracts.md)，CASE/参数迁移见 [迁移清单](migration.md)。

## 保留的缺口

完整表达式/函数/hint、条件编译和 SQLJ、部分 XMLType/ILM/In-Memory/sharding/ASM/provider-specific 分支等仍非完整建模范围；详见逐命令清单。自由表达式和程序体是有意保留的输入边界，不要求以另一套子语言实现替代。

不纳入未固定最低 RU 的 IF [NOT] EXISTS、SQL_MACRO、annotations 等增补。在线 `/19/` 文档会更新，不能据 URL 推断所有 RU 均支持某选项。

## 验证边界

本轮验证获得用户授权，未修改 AGENTS.md 的后续默认规则。使用固定版本真实 parser，检查全量文件及 0/1/2 次成员展开、标点和输入边界，命令与实际结果见 [验证说明](validation.md)。

没有运行 Oracle SQL、真实对象编译、数据库命令、Studio Pages 构建或消费方端到端测试，也没有生成 `.snf.json`。仓库不提供完整 Oracle 语义校验，不以“没有 CI”代替测试通过。
