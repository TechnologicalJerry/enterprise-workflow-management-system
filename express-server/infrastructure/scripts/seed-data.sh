#!/bin/bash
# ============================================
# Database Seeding Script
# ============================================

set -e

echo "🌱 Seeding databases..."

SERVICES=(
    "auth-service"
    "user-service"
    "permission-service"
    "workflow-definition-service"
)

for service in "${SERVICES[@]}"; do
    echo "📦 Seeding: $service"
    
    if [ -d "services/$service" ]; then
        cd "services/$service"
        
        if [ -f "prisma/seed.ts" ]; then
            npx prisma db seed || echo "⚠ Seeding failed for $service"
        fi
        
        cd ../..
    fi
done

echo "✅ Seeding complete!"
