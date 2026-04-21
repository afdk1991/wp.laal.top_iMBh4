# MIXMLAAL 部署指南

## 1. 环境要求

### 1.1 硬件要求

- **CPU**: 至少 4 核心
- **内存**: 至少 8GB RAM
- **磁盘**: 至少 50GB 可用空间
- **网络**: 稳定的网络连接

### 1.2 软件要求

- **Docker**: 20.0+  
- **Docker Compose**: 1.29+  
- **Node.js**: 16+ (仅开发环境需要)
- **Git**: 2.20+ (仅开发环境需要)

## 2. 部署方式

### 2.1 开发环境部署

#### 2.1.1 克隆代码

```bash
git clone https://github.com/yourusername/mixmlaal-app.git
cd mixmlaal-app
```

#### 2.1.2 安装依赖

```bash
npm install
```

#### 2.1.3 配置环境变量

创建 `.env` 文件，配置以下环境变量：

```env
# API 网关配置
API_GATEWAY_PORT=3000

# 用户服务配置
USER_SERVICE_PORT=3001

# 打车服务配置
RIDE_SERVICE_PORT=3002

# 电商服务配置
ECOMMERCE_SERVICE_URL=3003

# 支付服务配置
PAYMENT_SERVICE_URL=3004

# 订单服务配置
ORDER_SERVICE_URL=3005

# 社交服务配置
SOCIAL_SERVICE_URL=3006

# 门户服务配置
PORTAL_SERVICE_URL=3007

# 通用服务配置
COMMON_SERVICE_URL=3008

# 外卖服务配置
FOOD_SERVICE_URL=3009

# 跑腿服务配置
ERRAND_SERVICE_URL=3010

# 事务服务配置
TRANSACTION_SERVICE_URL=3011

# 数据库配置
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_USER=mixmlaal
MYSQL_PASSWORD=mixmlaal
MYSQL_DATABASE=mixmlaal

# Redis配置
REDIS_HOST=redis
REDIS_PORT=6379

# Kafka配置
KAFKA_HOST=kafka
KAFKA_PORT=9092

# JWT配置
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here

# 加密配置
ENCRYPTION_KEY=your-encryption-key-here

# OpenAI配置
OPENAI_API_KEY=your-openai-api-key-here

# CORS配置
CORS_ORIGIN=*
```

#### 2.1.4 启动服务

使用 Docker Compose 启动所有服务：

```bash
npm run docker:up
```

启动开发服务器：

```bash
npm run dev
```

启动前端开发服务器：

```bash
npm run dev:frontend
```

### 2.2 生产环境部署

#### 2.2.1 准备服务器

- 选择合适的云服务器或本地服务器
- 安装 Docker 和 Docker Compose
- 配置防火墙，开放必要的端口

#### 2.2.2 部署步骤

1. **克隆代码**

```bash
git clone https://github.com/yourusername/mixmlaal-app.git
cd mixmlaal-app
```

2. **配置环境变量**

创建 `.env` 文件，配置生产环境的环境变量，确保使用强密码和安全的密钥。

3. **构建镜像**

```bash
npm run build:all
```

4. **启动服务**

使用 Docker Compose 启动所有服务：

```bash
docker-compose -f docker-compose.prod.yml up -d
```

5. **配置反向代理**

使用 Nginx 或其他反向代理服务器配置 HTTPS 和负载均衡。

## 3. 服务管理

### 3.1 查看服务状态

```bash
docker-compose ps
```

### 3.2 查看服务日志

```bash
docker-compose logs -f [service-name]
```

### 3.3 重启服务

```bash
docker-compose restart [service-name]
```

### 3.4 停止服务

```bash
docker-compose down
```

## 4. 数据库管理

### 4.1 连接数据库

```bash
docker exec -it mixmlaal-mysql mysql -u mixmlaal -pmixmlaal mixmlaal
```

### 4.2 备份数据库

```bash
docker exec mixmlaal-mysql mysqldump -u mixmlaal -pmixmlaal mixmlaal > backup.sql
```

### 4.3 恢复数据库

```bash
docker exec -i mixmlaal-mysql mysql -u mixmlaal -pmixmlaal mixmlaal < backup.sql
```

## 5. 监控与日志

### 5.1 健康检查

服务健康检查地址：

- API 网关: `http://localhost:3000/api/v1/health`
- 用户服务: `http://localhost:3001/health`
- 其他服务: `http://localhost:{port}/health`

### 5.2 日志管理

- **容器日志**: 使用 `docker-compose logs` 查看
- **应用日志**: 服务日志存储在各自的容器中

## 6. 故障排查

### 6.1 常见问题

| 问题 | 可能原因 | 解决方案 |
|------|---------|----------|
| 服务启动失败 | 端口被占用 | 检查端口占用情况，修改配置 |
| 数据库连接失败 | 数据库服务未启动 | 检查数据库服务状态 |
| 服务间通信失败 | 网络配置问题 | 检查 Docker 网络配置 |
| 前端无法访问 API | CORS 配置问题 | 检查 CORS 配置 |

### 6.2 排查步骤

1. **查看服务状态**：`docker-compose ps`
2. **查看服务日志**：`docker-compose logs [service-name]`
3. **检查网络连接**：`docker network inspect mixmlaal-network`
4. **检查环境变量**：确保所有必要的环境变量都已配置
5. **检查端口映射**：确保容器端口正确映射到主机

## 7. 扩展与升级

### 7.1 服务扩展

- **水平扩展**：使用 Docker Compose 或 Kubernetes 扩展服务实例
- **垂直扩展**：增加服务器资源

### 7.2 版本升级

1. **备份数据**
2. **更新代码**：`git pull`
3. **构建新镜像**：`npm run build:all`
4. **重启服务**：`docker-compose up -d --build`

## 8. 安全配置

### 8.1 生产环境安全建议

- 使用强密码和密钥
- 配置 HTTPS
- 限制网络访问
- 定期更新依赖
- 启用防火墙
- 配置入侵检测系统

### 8.2 环境变量安全

- 不要在代码中硬编码敏感信息
- 使用环境变量管理敏感配置
- 生产环境使用密钥管理服务

## 9. 性能优化

### 9.1 数据库优化

- 建立适当的索引
- 优化查询语句
- 定期清理数据
- 使用连接池

### 9.2 缓存优化

- 合理使用 Redis 缓存
- 设置适当的缓存过期时间
- 避免缓存穿透和雪崩

### 9.3 服务优化

- 使用负载均衡
- 优化代码性能
- 合理使用异步处理
- 监控服务性能

## 10. 常见操作

### 10.1 添加新服务

1. 在 `docker-compose.yml` 中添加服务配置
2. 创建服务目录和代码
3. 启动服务：`docker-compose up -d`

### 10.2 配置 SSL

1. 获取 SSL 证书
2. 配置 Nginx 或 API 网关的 SSL 证书
3. 重启服务

### 10.3 监控设置

1. 安装监控工具（如 Prometheus、Grafana）
2. 配置监控指标
3. 设置告警规则

## 11. 部署架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     外部访问                               │
└───────────┬────────────────────────────────────────────────┘
            │
┌───────────▼────────────────────────────────────────────────┐
│                     负载均衡器                              │
└───────────┬────────────────────────────────────────────────┘
            │
┌───────────▼────────────────────────────────────────────────┐
│                     API 网关                               │
└───────────┬────────────────────────────────────────────────┘
            │
┌───────────▼────────────────────────────────────────────────┐
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  用户服务   │  │  打车服务   │  │  外卖服务   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  商城服务   │  │  跑腿服务   │  │  事务服务   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
└───────────┬────────────────────────────────────────────────┘
            │
┌───────────▼────────────────────────────────────────────────┐
│                     消息队列 (Kafka)                       │
└───────────┬────────────────────────────────────────────────┘
            │
┌───────────▼────────────────────────────────────────────────┐
│                     缓存 (Redis)                          │
└───────────┬────────────────────────────────────────────────┘
            │
┌───────────▼────────────────────────────────────────────────┐
│                     数据库 (MySQL)                        │
└─────────────────────────────────────────────────────────────┘
```

## 12. 总结

MIXMLAAL 项目采用微服务架构，使用 Docker 容器化部署，具有良好的可扩展性和可靠性。通过本指南，您可以快速部署和管理 MIXMLAAL 服务，确保系统的稳定运行。

如需更多帮助，请参考项目文档或联系技术支持。
