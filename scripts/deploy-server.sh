#!/bin/bash

# Video Uniqueizer Pro - Server Deployment Script
# Deploys License Server to a VPS (Ubuntu/Debian)

set -e

echo "🚀 Video Uniqueizer Pro - Server Deployment"
echo "==========================================="
echo ""

# Configuration
VPS_USER="${VPS_USER:-root}"
VPS_HOST="${VPS_HOST:-}"
APP_DIR="/opt/video-uniqueizer"

if [ -z "$VPS_HOST" ]; then
    echo "❌ Please set VPS_HOST environment variable"
    echo "   Example: export VPS_HOST=your.server.ip"
    exit 1
fi

echo "📋 Deployment Configuration:"
echo "   VPS User: $VPS_USER"
echo "   VPS Host: $VPS_HOST"
echo "   App Dir:  $APP_DIR"
echo ""

# Check if Docker is installed on VPS
echo "🔍 Checking VPS prerequisites..."
ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "docker --version" || {
    echo "⚠ Docker not found on VPS. Installing..."
    ssh "$VPS_USER@$VPS_HOST" "curl -fsSL https://get.docker.com | sh"
}

# Copy application files
echo "📦 Copying application files..."
scp apps/license-server/package.json "$VPS_USER@$VPS_HOST:/tmp/"
scp apps/license-server/tsconfig.json "$VPS_USER@$VPS_HOST:/tmp/"
scp -r apps/license-server/src "$VPS_USER@$VPS_HOST:/tmp/"
scp apps/license-server/prisma "$VPS_USER@$VPS_HOST:/tmp/"
scp apps/license-server/Dockerfile "$VPS_USER@$VPS_HOST:/tmp/"
scp apps/license-server/docker-compose.yml "$VPS_USER@$VPS_HOST:/tmp/"
scp apps/license-server/.env.example "$VPS_USER@$VPS_HOST:/tmp/.env"

# Deploy on VPS
echo "🔧 Deploying on VPS..."
ssh "$VPS_USER@$VPS_HOST" << 'ENDSSH'
cd /tmp

# Create app directory
sudo mkdir -p /opt/video-uniqueizer
sudo cp -r ./* /opt/video-uniqueizer/
cd /opt/video-uniqueizer

# Install dependencies
npm install --production

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Create admin user (you should change the password!)
echo "Creating default admin user..."
node -e "
const argon2 = require('argon2');
async function createAdmin() {
  const hash = await argon2.hash('ChangeThisPassword123!');
  console.log('Admin password hash:', hash);
}
createAdmin();
"

# Start with Docker Compose
docker-compose up -d

# Show status
docker-compose ps
ENDSSH

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. SSH to your VPS: ssh $VPS_USER@$VPS_HOST"
echo "   2. Update .env file with production secrets"
echo "   3. Set up SSL certificate (Let's Encrypt)"
echo "   4. Configure reverse proxy (nginx)"
echo "   5. Change default admin password"
echo ""
echo "🔐 Default admin credentials (CHANGE IMMEDIATELY):"
echo "   Username: admin"
echo "   Password: ChangeThisPassword123!"
echo ""
echo "📖 Admin panel: http://$VPS_HOST:3001/admin"
