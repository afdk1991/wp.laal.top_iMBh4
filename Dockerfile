# ============================================
# MIXMLAAL 后端API服务 Dockerfile
# 版本: v1.0.0.0
# 说明: 多阶段构建，优化镜像体积和安全性
# ============================================

# 依赖安装阶段
FROM node:18-alpine AS dependencies

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖
COPY --from=dependencies /app/node_modules ./node_modules

# 复制源代码
COPY . .

# 运行前端构建
RUN npm run build

# 生产阶段
FROM node:18-alpine AS production

# 安装必要工具
RUN apk add --no-cache curl ca-certificates dumb-init tzdata

# 设置时区
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 设置工作目录
WORKDIR /app

# 复制生产依赖
COPY --from=dependencies /app/node_modules ./node_modules

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 复制应用代码
COPY --chown=nodejs:nodejs src ./src
COPY --chown=nodejs:nodejs public ./public
COPY --chown=nodejs:nodejs package.json ./

# 创建日志目录
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# 切换到非root用户
USER nodejs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/v1/health || exit 1

# 使用dumb-init处理信号
ENTRYPOINT ["dumb-init", "--"]

# 启动命令
CMD ["node", "src/open/api/server.js"]
