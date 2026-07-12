#!/bin/bash
# ============================================================
#  LuxeDrive - One-Time Server Setup Script
#  Run this ONCE on your AWS server to prepare it for CI/CD
# ============================================================

set -e  # Stop on any error

echo "=============================================="
echo "  LuxeDrive - AWS Server Initial Setup"
echo "=============================================="

# --- 1. Install Node.js (v20 LTS) ---
echo ""
echo "📦 [1/7] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# --- 2. Install PM2 (process manager to keep your backend alive) ---
echo ""
echo "⚙️  [2/7] Installing PM2..."
sudo npm install -g pm2

# --- 3. Install NGINX ---
echo ""
echo "🌐 [3/7] Installing NGINX..."
sudo apt-get install -y nginx

# --- 4. Install Git ---
echo ""
echo "📁 [4/7] Installing Git..."
sudo apt-get install -y git

# --- 5. Set up Symlink and home directory permissions ---
echo ""
echo "🔗 [5/7] Linking repository and configuring permissions..."
sudo mkdir -p /var/www
sudo ln -sfn "$HOME/luxe-drive" /var/www/luxe-drive
chmod +x "$HOME"
echo "✅ Configured /var/www/luxe-drive symlink and home folder search permissions."

# --- 6. Create the .env file on the server ---
echo ""
echo "🔐 [6/7] Creating backend .env file..."
echo "⚠️  You must manually add your secrets with nano:"
echo "    sudo nano /var/www/luxe-drive/backend/.env"
echo ""
echo "    Paste these values (fill in your real secrets):"
echo "    ------------------------------------------------"
echo "    NODE_ENV=production"
echo "    PORT=5000"
echo "    MONGO_URI=your_mongodb_connection_string"
echo "    JWT_SECRET=your_jwt_secret_key"
echo "    RAZORPAY_KEY_ID=your_razorpay_key_id"
echo "    RAZORPAY_KEY_SECRET=your_razorpay_key_secret"
echo "    ------------------------------------------------"

# --- 7. Configure NGINX ---
echo ""
echo "🌐 [7/7] Writing NGINX config..."
sudo bash -c 'cat > /etc/nginx/sites-available/luxedrive <<EOF
server {
    listen 80;
    server_name _;  # <-- Listen dynamically to any domain or IP address

    # Serve the React build (frontend)
    root /var/www/luxe-drive/frontend/dist;
    index index.html;

    # Route all non-API requests to React (SPA support)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy all /api/* requests to Node.js backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # IMPORTANT: Proxy all /socket.io requests for real-time inventory and locking
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF'

sudo ln -sf /etc/nginx/sites-available/luxedrive /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "=============================================="
echo "  ✅ Server Setup Complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo "  1. Create /var/www/luxe-drive/backend/.env with your production secrets"
echo "  2. Run: cd /var/www/luxe-drive/backend && npm install --omit=dev"
echo "  3. Run: pm2 start server.js --name luxedrive-backend && pm2 save"
echo "  4. Run: cd /var/www/luxe-drive/frontend && npm install --legacy-peer-deps && npm run build"
echo "  5. Push to GitHub and watch auto-deploy kick in! 🚀"
