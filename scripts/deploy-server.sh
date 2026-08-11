#!/bin/bash
# Deploy License Server to VPS
# Usage: ./deploy-server.sh <VPS_IP> <SSH_USER>

set -e

VPS_IP=${1:-""}
SSH_USER=${2:-"root"}
PROJECT_NAME="video-uniqueizer"

if [ -z "$VPS_IP" ]; then
    echo "❌ Usage: $0 <VPS_IP> [SSH_USER]"
    echo "Example: $0 192.168.1.100 root"
    exit 1
fi

echo "🚀 Deploying License Server to $VPS_IP..."

# Build Docker image locally
echo "📦 Building Docker image..."
cd apps/license-server
docker build -t video-uniqueizer-license-server:latest .

# Tag and push to registry (replace with your registry)
echo "🏷️  Tagging image..."
docker tag video-uniqueizer-license-server:latest $SSH_USER/$PROJECT_NAME-license-server:latest

echo "📤 Pushing to registry..."
docker push $SSH_USER/$PROJECT_NAME-license-server:latest

# Deploy to VPS
echo "🚀 Deploying to VPS..."
scp docker-compose.yml $SSH_USER@$VPS_IP:/opt/$PROJECT_NAME/
scp .env $SSH_USER@$VPS_IP:/opt/$PROJECT_NAME/.env

ssh $SSH_USER@$VPS_IP << 'ENDSSH'
cd /opt/video-uniqueizer
docker-compose pull
docker-compose up -d
docker system prune -f
ENDSSH

echo "✅ Deployment complete!"
echo "Server should be available at http://$VPS_IP:3001"
