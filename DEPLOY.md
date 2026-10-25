# RentoBit — VPS Deployment Guide (Ubuntu / Debian)

This package contains the complete production build and source code for RentoBit.

---

## 1. System Requirements on VPS

Ensure your VPS has:
- **Node.js**: v20+ LTS (`curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs`)
- **PostgreSQL**: v14+ (`sudo apt update && sudo apt install -y postgresql postgresql-contrib`)
- **PM2**: (`sudo npm install -g pm2`)
- **Nginx** (optional, recommended for domain & SSL): (`sudo apt install -y nginx certbot python3-certbot-nginx`)

---

## 2. PostgreSQL Setup on VPS

Run in terminal:
```bash
sudo -u postgres psql
```

Inside PostgreSQL prompt:
```sql
CREATE DATABASE rentobit;
CREATE USER rentobit WITH ENCRYPTED PASSWORD 'StrongPassword123!';
GRANT ALL PRIVILEGES ON DATABASE rentobit TO rentobit;
ALTER DATABASE rentobit OWNER TO rentobit;
\q
```

---

## 3. Extract & Configure

1. Upload and extract the archive:
   ```bash
   mkdir -p /var/www/rentobit
   unzip rentobit-production-deploy.zip -d /var/www/rentobit
   cd /var/www/rentobit
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Set your database credentials:
   ```env
   PORT=3000
   APP_URL=https://your-domain.com
   PG_HOST=localhost
   PG_PORT=5432
   PG_USER=rentobit
   PG_PASSWORD=StrongPassword123!
   PG_DATABASE=rentobit
   DATABASE_URL=postgresql://rentobit:StrongPassword123!@localhost:5432/rentobit
   ```

3. Install production dependencies:
   ```bash
   npm install --omit=dev
   ```

*(Note: The `dist/` directory is already pre-compiled and included. You do not need to run `npm run build` on your VPS unless you modify frontend files).*

---

## 4. Run with PM2

Start the application:
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Check status:
```bash
pm2 status
pm2 logs rentobit
```

---

## 5. Nginx Configuration & SSL

Create `/etc/nginx/sites-available/rentobit`:
```nginx
server {
    server_name your-domain.com www.your-domain.com;

    client_max_body_size 30M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable & reload:
```bash
sudo ln -s /etc/nginx/sites-available/rentobit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```
