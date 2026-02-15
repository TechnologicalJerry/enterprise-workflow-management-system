# ============================================
# Enterprise Workflow Management System
# Makefile - Common Commands
# ============================================

.PHONY: help install build dev test lint format clean docker-up docker-down migrate seed

# Default target
help:
	@echo "Enterprise Workflow Management System - Available Commands"
	@echo ""
	@echo "Development:"
	@echo "  make install      - Install all dependencies"
	@echo "  make build        - Build all services"
	@echo "  make dev          - Start development servers"
	@echo "  make test         - Run all tests"
	@echo "  make test-unit    - Run unit tests only"
	@echo "  make test-int     - Run integration tests only"
	@echo "  make test-e2e     - Run e2e tests only"
	@echo "  make lint         - Run ESLint"
	@echo "  make format       - Run Prettier"
	@echo "  make clean        - Clean node_modules and dist"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up    - Start all services with Docker"
	@echo "  make docker-down  - Stop all Docker services"
	@echo "  make docker-dev   - Start development environment"
	@echo "  make docker-test  - Start test environment"
	@echo "  make docker-logs  - View Docker logs"
	@echo "  make docker-clean - Remove all Docker resources"
	@echo ""
	@echo "Database:"
	@echo "  make migrate      - Run all database migrations"
	@echo "  make migrate-gen  - Generate new migration"
	@echo "  make seed         - Seed databases with sample data"
	@echo "  make db-reset     - Reset all databases"
	@echo ""
	@echo "Utilities:"
	@echo "  make health       - Check health of all services"
	@echo "  make logs         - View application logs"

# Development
install:
	npm install
	npm run install:all

build:
	npm run build

dev:
	npm run dev

# Testing
test:
	npm run test --workspaces

test-unit:
	npm run test:unit --workspaces

test-int:
	npm run test:integration --workspaces

test-e2e:
	npm run test:e2e --workspaces

test-coverage:
	npm run test:coverage --workspaces

# Linting & Formatting
lint:
	npm run lint --workspaces

lint-fix:
	npm run lint:fix --workspaces

format:
	npm run format --workspaces

format-check:
	npm run format:check --workspaces

# Clean
clean:
	npm run clean
	rm -rf dist coverage .nyc_output

# Docker
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

docker-test:
	docker-compose -f docker-compose.test.yml up -d

docker-logs:
	docker-compose logs -f

docker-logs-service:
	@read -p "Service name: " service; \
	docker-compose logs -f $$service

docker-clean:
	docker-compose down -v --rmi local
	docker system prune -f

docker-rebuild:
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

# Database
migrate:
	./infrastructure/scripts/run-migrations.sh

migrate-gen:
	@read -p "Migration name: " name; \
	npm run migrate:generate --workspace=services/auth-service -- --name $$name

seed:
	./infrastructure/scripts/seed-data.sh

db-reset:
	docker-compose exec postgres psql -U workflow_admin -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	make migrate
	make seed

# Utilities
health:
	./infrastructure/scripts/health-check.sh

setup-local:
	./infrastructure/scripts/setup-local.sh

# Kafka
kafka-topics:
	docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list

kafka-create-topics:
	docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --create --topic user-events --partitions 3 --replication-factor 1
	docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --create --topic workflow-events --partitions 3 --replication-factor 1
	docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --create --topic task-events --partitions 3 --replication-factor 1
	docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --create --topic audit-events --partitions 3 --replication-factor 1
	docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --create --topic notification-events --partitions 3 --replication-factor 1

# Monitoring
prometheus:
	open http://localhost:9090

grafana:
	open http://localhost:3100

jaeger:
	open http://localhost:16686
