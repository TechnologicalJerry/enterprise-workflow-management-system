#!/bin/bash
# ============================================
# Health Check Script
# ============================================

set -e

echo "🏥 Checking service health..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Service endpoints
declare -A SERVICES=(
    ["API Gateway"]="http://localhost:3000/health"
    ["Auth Service"]="http://localhost:3001/health"
    ["User Service"]="http://localhost:3002/health"
    ["Permission Service"]="http://localhost:3003/health"
    ["Workflow Definition Service"]="http://localhost:3004/health"
    ["Workflow Instance Service"]="http://localhost:3005/health"
    ["Task Service"]="http://localhost:3006/health"
    ["Approval Service"]="http://localhost:3007/health"
    ["Document Service"]="http://localhost:3008/health"
    ["Audit Service"]="http://localhost:3009/health"
    ["Notification Service"]="http://localhost:3010/health"
    ["Reporting Service"]="http://localhost:3011/health"
)

echo ""
echo "Service Status:"
echo "==============="

healthy=0
unhealthy=0

for service in "${!SERVICES[@]}"; do
    url="${SERVICES[$service]}"
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
        echo -e "${GREEN}✓${NC} $service - Healthy"
        ((healthy++))
    else
        echo -e "${RED}✗${NC} $service - Unhealthy"
        ((unhealthy++))
    fi
done

echo ""
echo "==============="
echo -e "Healthy: ${GREEN}$healthy${NC}"
echo -e "Unhealthy: ${RED}$unhealthy${NC}"
echo ""

if [ $unhealthy -gt 0 ]; then
    exit 1
fi
