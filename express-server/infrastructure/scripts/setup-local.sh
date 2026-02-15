#!/bin/bash
# ============================================
# Local Development Setup Script
# ============================================

set -e

echo "🚀 Setting up Enterprise Workflow Management System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js is required but not installed.${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}npm is required but not installed.${NC}" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is required but not installed.${NC}" >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}Docker Compose is required but not installed.${NC}" >&2; exit 1; }

echo -e "${GREEN}✓ All prerequisites met${NC}"

# Create .env file if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please update .env with your configuration${NC}"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start infrastructure services
echo "🐳 Starting infrastructure services..."
docker-compose up -d postgres redis kafka zookeeper

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if PostgreSQL is ready
until docker-compose exec -T postgres pg_isready -U workflow_admin; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done

echo -e "${GREEN}✓ PostgreSQL is ready${NC}"

# Check if Redis is ready
until docker-compose exec -T redis redis-cli ping | grep -q PONG; do
    echo "Waiting for Redis..."
    sleep 2
done

echo -e "${GREEN}✓ Redis is ready${NC}"

# Run database migrations
echo "🔄 Running database migrations..."
npm run migrate --workspaces || true

# Seed initial data
echo "🌱 Seeding initial data..."
npm run seed --workspaces || true

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Update .env with your configuration"
echo "  2. Run 'npm run dev' to start all services"
echo "  3. Access API Gateway at http://localhost:3000"
echo "  4. Access Swagger docs at http://localhost:3000/api/docs"
echo ""
