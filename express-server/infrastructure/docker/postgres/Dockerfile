# ============================================
# PostgreSQL Docker Image for Workflow System
# ============================================

FROM postgres:16-alpine

LABEL maintainer="Workflow System Team"
LABEL description="PostgreSQL for Enterprise Workflow Management System"

# Copy initialization script
COPY init-databases.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/init-databases.sh

# Copy custom configuration
COPY postgresql.conf /etc/postgresql/postgresql.conf

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
    CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB || exit 1

EXPOSE 5432
