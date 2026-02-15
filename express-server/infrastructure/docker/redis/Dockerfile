# ============================================
# Redis Docker Image for Workflow System
# ============================================

FROM redis:7-alpine

LABEL maintainer="Workflow System Team"
LABEL description="Redis for Enterprise Workflow Management System"

# Copy custom configuration
COPY redis.conf /usr/local/etc/redis/redis.conf

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=5 \
    CMD redis-cli --raw incr ping || exit 1

EXPOSE 6379

CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
