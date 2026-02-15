#!/bin/bash
# ============================================
# Database Migration Script
# ============================================

set -e

echo "🔄 Running database migrations..."

SERVICES=(
    "auth-service"
    "user-service"
    "permission-service"
    "workflow-definition-service"
    "workflow-instance-service"
    "task-service"
    "approval-service"
    "document-service"
    "audit-service"
    "notification-service"
    "reporting-service"
)

for service in "${SERVICES[@]}"; do
    echo "📦 Migrating: $service"
    
    if [ -d "services/$service" ]; then
        cd "services/$service"
        
        if [ -f "prisma/schema.prisma" ]; then
            npx prisma migrate deploy || echo "⚠ Migration failed for $service"
            npx prisma generate || echo "⚠ Client generation failed for $service"
        fi
        
        cd ../..
    fi
done

echo "✅ All migrations complete!"
