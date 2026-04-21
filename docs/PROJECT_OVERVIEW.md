# 米小米拉阿狸 (MIXMLAAL) 项目文档

## 1. 项目概述

### 1.1 项目简介
米小米拉阿狸 (MIXMLAAL) 是一个集商城、社交、管理于一体的多平台生态应用系统，采用前后端分离架构，支持Web、移动端、小程序等全平台。

### 1.2 核心功能
- **商城系统**：商品管理、购物车、订单、支付
- **社交系统**：动态、评论、私信、用户主页
- **配送系统**：地址管理、路径规划、物流追踪
- **管理后台**：权限管理、数据统计、系统配置
- **AI服务**：智能推荐、内容生成、客服

### 1.3 技术架构
- **前端**：Vue 3、React、Capacitor、uni-app
- **后端**：Node.js、Express、FastAPI
- **数据库**：MySQL、Redis
- **部署**：Docker、Nginx、PM2

## 2. 开发环境搭建

### 2.1 前置要求
- Node.js 16+
- npm 7+
- MySQL 5.7+
- Redis 6.0+
- Docker (可选)

### 2.2 环境配置
1. **克隆项目**
   ```bash
   git clone <项目地址>
   cd wp.laal.top_iMBh4
   ```

2. **安装依赖**
   ```bash
   # 主项目依赖
   npm install
   
   # 后端API依赖
   cd mixmlaal-app/apps/api
   npm install
   
   # 前端依赖
   cd ../frontend
   npm install
   ```

3. **环境变量配置**
   ```bash
   # 复制环境变量模板
   cp .env.example .env
   # 编辑配置文件
   ```

## 3. 项目结构

```
mixmlaal-app/
├── apps/                  # 各端应用
│   ├── api/              # 后端API服务
│   ├── frontend/         # 前端Web应用
│   ├── admin/            # 管理后台
│   └── miniapp/          # 小程序
├── src/                   # 核心源码
├── shared/                # 共享组件和工具
├── services/              # 微服务
├── docs/                  # 项目文档
├── android/               # Android应用
└── ios/                   # iOS应用
```

## 4. 开发流程

### 4.1 后端开发
1. **启动开发服务器**
   ```bash
   cd mixmlaal-app/apps/api
   npm run dev
   ```

2. **API文档访问**
   - Swagger文档：http://localhost:3000/api/docs

### 4.2 前端开发
1. **启动开发服务器**
   ```bash
   cd mixmlaal-app/apps/frontend
   npm run dev
   ```

2. **访问前端应用**
   - 开发环境：http://localhost:5173

### 4.3 小程序开发
1. **配置小程序开发者工具**
2. **导入项目**：选择 `mixmlaal-app/miniapp` 目录
3. **预览和调试**

## 5. 部署指南

### 5.1 生产环境部署
1. **构建项目**
   ```bash
   # 构建前端
   cd mixmlaal-app/apps/frontend
   npm run build
   
   # 构建后端
   cd ../api
   npm run build
   ```

2. **Docker部署**
   ```bash
   # 启动所有服务
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Nginx配置**
   - 配置文件：`mixmlaal-app/nginx/nginx.conf`

### 5.2 多环境部署
- **开发环境**：本地开发服务器
- **测试环境**：Docker Compose
- **生产环境**：Docker + Nginx + PM2

## 6. API文档

### 6.1 认证相关
- **登录**：POST /api/auth/login
- **注册**：POST /api/auth/register
- **刷新Token**：POST /api/auth/refresh

### 6.2 商城相关
- **商品列表**：GET /api/mall/products
- **商品详情**：GET /api/mall/products/{id}
- **购物车**：POST /api/mall/cart
- **订单**：POST /api/mall/orders

### 6.3 社交相关
- **动态列表**：GET /api/blog/posts
- **发布动态**：POST /api/blog/posts
- **评论**：POST /api/blog/comments

## 7. 测试指南

### 7.1 单元测试
```bash
# 运行单元测试
npm run test:unit
```

### 7.2 集成测试
```bash
# 运行集成测试
npm run test:integration
```

### 7.3 E2E测试
```bash
# 运行E2E测试
npm run test:e2e
```

## 8. 运维指南

### 8.1 监控系统
- **Prometheus**：性能监控
- **日志管理**：结构化日志

### 8.2 健康检查
```bash
# 运行健康检查
node scripts/deploy/health-check.js
```

### 8.3 备份策略
- **数据库备份**：定期备份MySQL
- **代码备份**：Git版本控制

## 9. 安全规范

### 9.1 安全措施
- **HTTPS**：所有接口使用HTTPS
- **CORS**：配置跨域资源共享
- **输入验证**：防止注入攻击
- **认证授权**：JWT + 权限控制

### 9.2 安全检查
- **依赖扫描**：定期检查依赖漏洞
- **代码审计**：安全代码审查

## 10. 性能优化

### 10.1 前端优化
- **代码分割**：按需加载
- **缓存策略**：合理使用缓存
- **图片优化**：压缩和懒加载

### 10.2 后端优化
- **数据库索引**：优化查询
- **Redis缓存**：减轻数据库压力
- **异步处理**：非阻塞操作

## 11. 国际化

### 11.1 多语言支持
- **语言文件**：`i18n/` 目录
- **切换语言**：通过API或前端设置

### 11.2 本地化
- **日期格式**：根据地区设置
- **货币格式**：根据地区设置

## 12. 故障排查

### 12.1 常见问题
- **数据库连接失败**：检查配置和服务状态
- **API响应慢**：检查Redis和数据库性能
- **前端加载慢**：检查资源大小和网络

### 12.2 日志分析
- **错误日志**：`logs/` 目录
- **访问日志**：Nginx日志

## 13. 版本管理

### 13.1 版本号规则
- **格式**：MAJOR.MINOR.PATCH
- **示例**：1.0.0

### 13.2 发布流程
1. **开发**：feature分支
2. **测试**：test分支
3. **发布**：master分支

## 14. 贡献指南

### 14.1 代码规范
- **前端**：ESLint + Prettier
- **后端**：ESLint + 代码风格

### 14.2 提交规范
- **格式**：type(scope): description
- **示例**：feat(auth): 添加OAuth2认证

## 15. 联系方式

### 15.1 团队成员
- **项目负责人**：[姓名]
- **技术支持**：[邮箱]

### 15.2 问题反馈
- **GitHub Issues**：项目仓库
- **邮件**：[邮箱]

---

**文档版本**：1.0.0
**最后更新**：2026-04-20