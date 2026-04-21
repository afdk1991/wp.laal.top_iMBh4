# MIXMLAAL 项目 - RuoYi-Vue 低代码版本

本版本基于 RuoYi-Vue 二次开发，集成低代码生成器，开箱即用。

## 技术栈

- 前端：Vue 3 + Element Plus + Vite
- 后端：Java 17 + Spring Boot 3.2 + MyBatis-Plus
- 数据库：MySQL 8.0
- 缓存：Redis

## 快速开始

### 后端启动

```bash
cd ruoyi-admin/src/main/java/com/mixmlaal
mvn spring-boot:run
```

### 前端启动

```bash
cd ruoyi-admin-ui
npm install
npm run dev
```

## 核心功能

### 低代码生成

- 代码生成器：基于数据库表自动生成 CRUD 代码
- 表单设计器：可视化配置表单
- 流程设计器：业务流程配置

### 用户管理

- 用户 CRUD
- 角色权限分配
- 部门管理
- 岗位管理

### 系统管理

- 菜单管理
- 字典管理
- 参数配置
- 系统日志

## API 文档

访问 http://localhost:8088/swagger-ui.html 查看完整 API 文档。

## 默认账号

- 管理员：admin / admin123
