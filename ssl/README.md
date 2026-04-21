# SSL 证书配置

## 生成自签名证书

### 方法一：使用 OpenSSL 生成

1. 进入 ssl 目录
2. 运行以下命令生成私钥：
   ```bash
   openssl genrsa -out laal.top.key 2048
   ```
3. 运行以下命令生成证书请求：
   ```bash
   openssl req -new -key laal.top.key -out laal.top.csr
   ```
4. 运行以下命令生成自签名证书：
   ```bash
   openssl x509 -req -days 365 -in laal.top.csr -signkey laal.top.key -out laal.top.crt
   ```

### 方法二：使用 mkcert 生成（推荐）

1. 安装 mkcert：
   ```bash
   # Windows
   choco install mkcert
   
   # macOS
   brew install mkcert
   
   # Linux
   sudo apt install libnss3-tools
   curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
   chmod +x mkcert-v*-linux-amd64
   sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
   ```

2. 初始化 mkcert：
   ```bash
   mkcert -install
   ```

3. 生成证书：
   ```bash
   mkcert -key-file laal.top.key -cert-file laal.top.crt laal.top *.laal.top
   ```

## 生产环境配置

在生产环境中，建议使用真实的 SSL 证书，例如：

1. **Let's Encrypt** - 免费的 SSL 证书
2. **阿里云 SSL** - 付费 SSL 证书
3. **腾讯云 SSL** - 付费 SSL 证书

### Let's Encrypt 证书申请

1. 安装 Certbot：
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. 申请证书：
   ```bash
   sudo certbot --nginx -d laal.top -d *.laal.top
   ```

3. 自动续期：
   ```bash
   sudo certbot renew --dry-run
   ```

## 配置说明

- `laal.top.key` - 私钥文件
- `laal.top.crt` - 证书文件
- 证书文件需要放在 `/etc/nginx/ssl/` 目录下（Docker 容器内）

## 注意事项

1. 自签名证书在浏览器中会显示安全警告，这是正常的
2. 生产环境必须使用真实的 SSL 证书
3. 证书有效期一般为 1 年，需要定期更新
4. 私钥文件要妥善保管，不要泄露
