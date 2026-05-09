#!/bin/bash
set -e

echo "Starting deployment..."
sudo apt update -y
sudo DEBIAN_FRONTEND=noninteractive apt install -y docker.io git curl
sudo systemctl start docker
sudo systemctl enable docker

echo "Installing docker-compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "Cloning repository..."
if [ -d "linkhub" ]; then
  cd linkhub
  git pull origin main
else
  git clone https://github.com/nikhileshshingade21-eng/linkhub.git
  cd linkhub
fi

echo "Setting up environment variables..."
cat << 'EOF' > .env
DATABASE_URL=postgresql://postgres.kxusdcgrhrrkdiccgtcr:6s72n6UhUDBsjtyS@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
JWT_SECRET=lh_sec_8f92a4bc843e11f
JWT_REFRESH_SECRET=lh_ref_992bcc3da21991
PORT=3001
NODE_ENV=production
CLIENT_URL=https://linkhubnew.duckdns.org
EOF

echo "Building and starting Docker containers..."
sudo docker-compose up -d --build

echo "Deployment complete!"
