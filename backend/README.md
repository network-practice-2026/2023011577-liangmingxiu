# 后端说明

本目录为计算机网络实习项目的后端接口代码，用于支撑任务三“计算机网络知识体系综合展示与交互学习”。

## 技术栈

- Node.js
- Express
- MySQL
- mysql2

## 接口

前端已对接以下接口：

```text
GET    /api/knowledge/layers
POST   /api/knowledge/layers/:layerId/points
PUT    /api/knowledge/layers/:layerId/points/:pointId
DELETE /api/knowledge/layers/:layerId/points/:pointId
```

其中 `layerId` 可取：

```text
application
transport
network
datalink
physical
```

## 数据库

SQL 文件位于：

```text
backend/sql/network_knowledge.sql
```

该 SQL 创建：

- `tcpip_layers`：五层模型基础信息表
- `application_layer_points`：应用层知识点表
- `transport_layer_points`：传输层知识点表
- `network_layer_points`：网络层知识点表
- `datalink_layer_points`：数据链路层知识点表
- `physical_layer_points`：物理层知识点表

## 配置

复制 `.env.example` 为 `.env`，并按本机 MySQL 配置修改数据库账号密码。

本次只写入后端代码和 SQL 文件，未执行安装、启动或建库操作。
