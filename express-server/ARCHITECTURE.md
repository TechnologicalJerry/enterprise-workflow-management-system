# Enterprise Workflow Management System - Architecture

## Folder Structure Overview

```
express-server/
│
├── package.json                          # Root package.json with workspaces
├── tsconfig.base.json                    # Shared TypeScript configuration
├── .env.example                          # Environment variables template
├── .eslintrc.js                          # ESLint configuration
├── .prettierrc                           # Prettier configuration
├── .gitignore                            # Git ignore rules
├── .dockerignore                         # Docker ignore rules
├── docker-compose.yml                    # Full stack orchestration
├── docker-compose.dev.yml                # Development overrides
├── docker-compose.test.yml               # Testing environment
├── Makefile                              # Common commands
├── README.md                             # Project documentation
├── ARCHITECTURE.md                       # This file
│
├── .github/
│   └── workflows/
│       ├── ci.yml                        # Continuous Integration
│       ├── cd.yml                        # Continuous Deployment
│       ├── security-scan.yml             # Security scanning
│       ├── dependency-check.yml          # Dependency vulnerability check
│       └── release.yml                   # Release automation
│
├── infrastructure/
│   ├── docker/
│   │   ├── postgres/
│   │   │   ├── Dockerfile
│   │   │   ├── init-databases.sh         # Multi-database initialization
│   │   │   └── postgresql.conf
│   │   ├── redis/
│   │   │   ├── Dockerfile
│   │   │   └── redis.conf
│   │   ├── kafka/
│   │   │   ├── Dockerfile
│   │   │   └── server.properties
│   │   └── nginx/
│   │       ├── Dockerfile
│   │       └── nginx.conf
│   ├── kubernetes/
│   │   ├── base/
│   │   │   ├── namespace.yaml
│   │   │   ├── configmap.yaml
│   │   │   ├── secrets.yaml
│   │   │   └── network-policy.yaml
│   │   ├── services/
│   │   │   ├── api-gateway/
│   │   │   │   ├── deployment.yaml
│   │   │   │   ├── service.yaml
│   │   │   │   ├── hpa.yaml
│   │   │   │   └── ingress.yaml
│   │   │   └── [service-name]/           # Repeated for each service
│   │   │       ├── deployment.yaml
│   │   │       ├── service.yaml
│   │   │       └── hpa.yaml
│   │   └── monitoring/
│   │       ├── prometheus/
│   │       │   ├── prometheus.yaml
│   │       │   └── alerting-rules.yaml
│   │       └── grafana/
│   │           └── dashboards/
│   ├── helm/
│   │   └── workflow-system/
│   │       ├── Chart.yaml
│   │       ├── values.yaml
│   │       ├── values-dev.yaml
│   │       ├── values-staging.yaml
│   │       ├── values-prod.yaml
│   │       └── templates/
│   └── scripts/
│       ├── setup-local.sh
│       ├── seed-data.sh
│       ├── run-migrations.sh
│       └── health-check.sh
│
├── shared/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                      # Barrel export
│       │
│       ├── constants/
│       │   ├── index.ts
│       │   ├── http-status.constants.ts
│       │   ├── error-codes.constants.ts
│       │   ├── kafka-topics.constants.ts
│       │   ├── redis-keys.constants.ts
│       │   ├── permissions.constants.ts
│       │   └── workflow-states.constants.ts
│       │
│       ├── types/
│       │   ├── index.ts
│       │   ├── common.types.ts
│       │   ├── auth.types.ts
│       │   ├── user.types.ts
│       │   ├── workflow.types.ts
│       │   ├── task.types.ts
│       │   ├── approval.types.ts
│       │   ├── document.types.ts
│       │   ├── notification.types.ts
│       │   ├── audit.types.ts
│       │   ├── pagination.types.ts
│       │   ├── api-response.types.ts
│       │   ├── kafka-message.types.ts
│       │   └── service-registry.types.ts
│       │
│       ├── interfaces/
│       │   ├── index.ts
│       │   ├── base-entity.interface.ts
│       │   ├── repository.interface.ts
│       │   ├── service.interface.ts
│       │   ├── event-handler.interface.ts
│       │   ├── cache.interface.ts
│       │   └── logger.interface.ts
│       │
│       ├── dto/
│       │   ├── index.ts
│       │   ├── pagination.dto.ts
│       │   ├── api-response.dto.ts
│       │   ├── error-response.dto.ts
│       │   └── health-check.dto.ts
│       │
│       ├── errors/
│       │   ├── index.ts
│       │   ├── base.error.ts
│       │   ├── http.error.ts
│       │   ├── validation.error.ts
│       │   ├── authentication.error.ts
│       │   ├── authorization.error.ts
│       │   ├── not-found.error.ts
│       │   ├── conflict.error.ts
│       │   ├── rate-limit.error.ts
│       │   ├── service-unavailable.error.ts
│       │   └── database.error.ts
│       │
│       ├── utils/
│       │   ├── index.ts
│       │   ├── async-handler.util.ts
│       │   ├── crypto.util.ts
│       │   ├── date.util.ts
│       │   ├── string.util.ts
│       │   ├── object.util.ts
│       │   ├── retry.util.ts
│       │   ├── idempotency.util.ts
│       │   └── pagination.util.ts
│       │
│       ├── validators/
│       │   ├── index.ts
│       │   ├── common.validators.ts
│       │   ├── uuid.validator.ts
│       │   ├── email.validator.ts
│       │   ├── password.validator.ts
│       │   └── custom-validators/
│       │       └── index.ts
│       │
│       ├── middleware/
│       │   ├── index.ts
│       │   ├── correlation-id.middleware.ts
│       │   ├── request-logger.middleware.ts
│       │   ├── error-handler.middleware.ts
│       │   ├── not-found.middleware.ts
│       │   └── timeout.middleware.ts
│       │
│       ├── events/
│       │   ├── index.ts
│       │   ├── base-event.ts
│       │   ├── domain-events/
│       │   │   ├── index.ts
│       │   │   ├── user-events.ts
│       │   │   ├── workflow-events.ts
│       │   │   ├── task-events.ts
│       │   │   ├── approval-events.ts
│       │   │   └── audit-events.ts
│       │   └── integration-events/
│       │       ├── index.ts
│       │       └── notification-events.ts
│       │
│       ├── contracts/
│       │   ├── index.ts
│       │   └── api/
│       │       ├── v1/
│       │       │   ├── auth.contract.ts
│       │       │   ├── user.contract.ts
│       │       │   ├── workflow.contract.ts
│       │       │   └── task.contract.ts
│       │       └── v2/
│       │           └── .gitkeep
│       │
│       └── testing/
│           ├── index.ts
│           ├── fixtures/
│           │   ├── user.fixture.ts
│           │   ├── workflow.fixture.ts
│           │   └── task.fixture.ts
│           ├── mocks/
│           │   ├── logger.mock.ts
│           │   ├── cache.mock.ts
│           │   ├── kafka.mock.ts
│           │   └── repository.mock.ts
│           └── helpers/
│               ├── database.helper.ts
│               ├── auth.helper.ts
│               └── request.helper.ts
│
├── api-gateway/
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.ts
│   ├── Dockerfile
│   ├── .env.example
│   └── src/
│       ├── server.ts                     # Server bootstrap
│       ├── app.ts                        # Express app setup
│       │
│       ├── config/
│       │   ├── index.ts
│       │   ├── app.config.ts
│       │   ├── services.config.ts        # Service registry URLs
│       │   ├── rate-limit.config.ts
│       │   ├── cors.config.ts
│       │   ├── redis.config.ts
│       │   └── swagger.config.ts
│       │
│       ├── routes/
│       │   ├── index.ts
│       │   ├── v1/
│       │   │   ├── index.ts
│       │   │   ├── auth.routes.ts
│       │   │   ├── users.routes.ts
│       │   │   ├── workflows.routes.ts
│       │   │   ├── tasks.routes.ts
│       │   │   ├── approvals.routes.ts
│       │   │   ├── documents.routes.ts
│       │   │   ├── notifications.routes.ts
│       │   │   ├── reports.routes.ts
│       │   │   └── health.routes.ts
│       │   └── v2/
│       │       └── index.ts
│       │
│       ├── controllers/
│       │   ├── index.ts
│       │   ├── proxy.controller.ts
│       │   └── health.controller.ts
│       │
│       ├── middlewares/
│       │   ├── index.ts
│       │   ├── auth/
│       │   │   ├── index.ts
│       │   │   ├── jwt-verify.middleware.ts
│       │   │   ├── jwt-refresh.middleware.ts
│       │   │   ├── api-key.middleware.ts
│       │   │   └── optional-auth.middleware.ts
│       │   ├── security/
│       │   │   ├── index.ts
│       │   │   ├── helmet.middleware.ts
│       │   │   ├── cors.middleware.ts
│       │   │   ├── rate-limiter.middleware.ts
│       │   │   ├── xss-clean.middleware.ts
│       │   │   ├── hpp.middleware.ts
│       │   │   └── request-sanitizer.middleware.ts
│       │   ├── validation/
│       │   │   ├── index.ts
│       │   │   └── request-validator.middleware.ts
│       │   ├── logging/
│       │   │   ├── index.ts
│       │   │   ├── request-logger.middleware.ts
│       │   │   └── correlation-id.middleware.ts
│       │   └── proxy/
│       │       ├── index.ts
│       │       ├── service-proxy.middleware.ts
│       │       └── load-balancer.middleware.ts
│       │
│       ├── services/
│       │   ├── index.ts
│       │   ├── proxy.service.ts
│       │   ├── service-registry.service.ts
│       │   ├── health-aggregator.service.ts
│       │   └── token-blacklist.service.ts
│       │
│       ├── integrations/
│       │   ├── index.ts
│       │   ├── http-client/
│       │   │   ├── index.ts
│       │   │   ├── axios-client.ts
│       │   │   ├── interceptors/
│       │   │   │   ├── index.ts
│       │   │   │   ├── auth.interceptor.ts
│       │   │   │   ├── retry.interceptor.ts
│       │   │   │   ├── timeout.interceptor.ts
│       │   │   │   └── correlation.interceptor.ts
│       │   │   └── circuit-breaker/
│       │   │       ├── index.ts
│       │   │       ├── circuit-breaker.ts
│       │   │       └── circuit-breaker.config.ts
│       │   └── redis/
│       │       ├── index.ts
│       │       └── redis-client.ts
│       │
│       ├── observability/
│       │   ├── index.ts
│       │   ├── logger/
│       │   │   ├── index.ts
│       │   │   ├── winston.logger.ts
│       │   │   └── transports/
│       │   │       ├── console.transport.ts
│       │   │       └── file.transport.ts
│       │   ├── metrics/
│       │   │   ├── index.ts
│       │   │   ├── prometheus.metrics.ts
│       │   │   └── collectors/
│       │   │       ├── http.collector.ts
│       │   │       └── system.collector.ts
│       │   └── tracing/
│       │       ├── index.ts
│       │       ├── opentelemetry.config.ts
│       │       └── span-helpers.ts
│       │
│       ├── utils/
│       │   ├── index.ts
│       │   └── response.util.ts
│       │
│       ├── types/
│       │   ├── index.ts
│       │   ├── express.d.ts
│       │   └── gateway.types.ts
│       │
│       └── docs/
│           ├── swagger.ts
│           └── schemas/
│               ├── index.ts
│               ├── common.schema.ts
│               ├── auth.schema.ts
│               └── error.schema.ts
│
├── services/
│   │
│   ├── auth-service/                     # FULL EXAMPLE SERVICE
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── jest.config.ts
│   │   ├── Dockerfile
│   │   ├── .env.example
│   │   │
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   │   └── .gitkeep
│   │   │   └── seed.ts
│   │   │
│   │   └── src/
│   │       ├── server.ts
│   │       ├── app.ts
│   │       │
│   │       ├── config/
│   │       │   ├── index.ts
│   │       │   ├── app.config.ts
│   │       │   ├── database.config.ts
│   │       │   ├── redis.config.ts
│   │       │   ├── kafka.config.ts
│   │       │   ├── jwt.config.ts
│   │       │   └── swagger.config.ts
│   │       │
│   │       ├── controllers/
│   │       │   ├── index.ts
│   │       │   ├── auth.controller.ts
│   │       │   ├── token.controller.ts
│   │       │   └── health.controller.ts
│   │       │
│   │       ├── services/
│   │       │   ├── index.ts
│   │       │   ├── auth.service.ts
│   │       │   ├── token.service.ts
│   │       │   ├── password.service.ts
│   │       │   ├── session.service.ts
│   │       │   └── otp.service.ts
│   │       │
│   │       ├── repositories/
│   │       │   ├── index.ts
│   │       │   ├── base.repository.ts
│   │       │   ├── user-credentials.repository.ts
│   │       │   ├── refresh-token.repository.ts
│   │       │   └── session.repository.ts
│   │       │
│   │       ├── models/
│   │       │   ├── index.ts
│   │       │   ├── user-credentials.model.ts
│   │       │   ├── refresh-token.model.ts
│   │       │   └── session.model.ts
│   │       │
│   │       ├── routes/
│   │       │   ├── index.ts
│   │       │   ├── v1/
│   │       │   │   ├── index.ts
│   │       │   │   ├── auth.routes.ts
│   │       │   │   ├── token.routes.ts
│   │       │   │   └── health.routes.ts
│   │       │   └── v2/
│   │       │       └── index.ts
│   │       │
│   │       ├── middlewares/
│   │       │   ├── index.ts
│   │       │   ├── auth/
│   │       │   │   ├── index.ts
│   │       │   │   └── local-auth.middleware.ts
│   │       │   ├── validation/
│   │       │   │   ├── index.ts
│   │       │   │   └── auth-validator.middleware.ts
│   │       │   └── rate-limit/
│   │       │       ├── index.ts
│   │       │       └── login-rate-limit.middleware.ts
│   │       │
│   │       ├── security/
│   │       │   ├── index.ts
│   │       │   ├── jwt/
│   │       │   │   ├── index.ts
│   │       │   │   ├── jwt.strategy.ts
│   │       │   │   ├── jwt-access.generator.ts
│   │       │   │   ├── jwt-refresh.generator.ts
│   │       │   │   └── jwt.verifier.ts
│   │       │   ├── password/
│   │       │   │   ├── index.ts
│   │       │   │   ├── bcrypt.hasher.ts
│   │       │   │   └── password-policy.validator.ts
│   │       │   └── token-rotation/
│   │       │       ├── index.ts
│   │       │       └── refresh-token-rotation.ts
│   │       │
│   │       ├── observability/
│   │       │   ├── index.ts
│   │       │   ├── logger/
│   │       │   │   ├── index.ts
│   │       │   │   └── winston.logger.ts
│   │       │   ├── metrics/
│   │       │   │   ├── index.ts
│   │       │   │   ├── prometheus.metrics.ts
│   │       │   │   └── auth-metrics.collector.ts
│   │       │   └── tracing/
│   │       │       ├── index.ts
│   │       │       └── opentelemetry.config.ts
│   │       │
│   │       ├── integrations/
│   │       │   ├── index.ts
│   │       │   ├── redis/
│   │       │   │   ├── index.ts
│   │       │   │   ├── redis-client.ts
│   │       │   │   └── token-blacklist.redis.ts
│   │       │   └── user-service/
│   │       │       ├── index.ts
│   │       │       └── user-service.client.ts
│   │       │
│   │       ├── events/
│   │       │   ├── index.ts
│   │       │   ├── producers/
│   │       │   │   ├── index.ts
│   │       │   │   ├── base.producer.ts
│   │       │   │   └── auth-events.producer.ts
│   │       │   ├── consumers/
│   │       │   │   ├── index.ts
│   │       │   │   ├── base.consumer.ts
│   │       │   │   └── user-events.consumer.ts
│   │       │   └── handlers/
│   │       │       ├── index.ts
│   │       │       └── user-deleted.handler.ts
│   │       │
│   │       ├── database/
│   │       │   ├── index.ts
│   │       │   ├── prisma-client.ts
│   │       │   ├── connection.ts
│   │       │   └── health-check.ts
│   │       │
│   │       ├── utils/
│   │       │   ├── index.ts
│   │       │   ├── async-handler.util.ts
│   │       │   └── response.util.ts
│   │       │
│   │       ├── validators/
│   │       │   ├── index.ts
│   │       │   ├── login.validator.ts
│   │       │   ├── register.validator.ts
│   │       │   ├── refresh-token.validator.ts
│   │       │   └── password-reset.validator.ts
│   │       │
│   │       ├── dto/
│   │       │   ├── index.ts
│   │       │   ├── request/
│   │       │   │   ├── index.ts
│   │       │   │   ├── login.dto.ts
│   │       │   │   ├── register.dto.ts
│   │       │   │   ├── refresh-token.dto.ts
│   │       │   │   ├── logout.dto.ts
│   │       │   │   └── password-reset.dto.ts
│   │       │   └── response/
│   │       │       ├── index.ts
│   │       │       ├── auth-tokens.dto.ts
│   │       │       ├── user-session.dto.ts
│   │       │       └── auth-status.dto.ts
│   │       │
│   │       ├── types/
│   │       │   ├── index.ts
│   │       │   ├── express.d.ts
│   │       │   ├── auth.types.ts
│   │       │   └── jwt-payload.types.ts
│   │       │
│   │       └── docs/
│   │           ├── swagger.ts
│   │           └── schemas/
│   │               ├── index.ts
│   │               ├── auth.schema.ts
│   │               └── token.schema.ts
│   │
│   ├── tests/                            # Auth service tests
│   │   ├── unit/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.spec.ts
│   │   │   │   ├── token.service.spec.ts
│   │   │   │   └── password.service.spec.ts
│   │   │   ├── security/
│   │   │   │   ├── jwt.strategy.spec.ts
│   │   │   │   └── bcrypt.hasher.spec.ts
│   │   │   └── validators/
│   │   │       └── login.validator.spec.ts
│   │   ├── integration/
│   │   │   ├── auth.integration.spec.ts
│   │   │   ├── token.integration.spec.ts
│   │   │   └── setup/
│   │   │       ├── jest.setup.ts
│   │   │       ├── test-database.ts
│   │   │       └── test-fixtures.ts
│   │   └── e2e/
│   │       ├── auth-flow.e2e.spec.ts
│   │       └── setup/
│   │           └── e2e.setup.ts
│   │
│   │
│   │  # ============================================
│   │  # TEMPLATE FOR REMAINING 11 SERVICES
│   │  # Each service follows this exact structure
│   │  # ============================================
│   │
│   ├── user-service/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── jest.config.ts
│   │   ├── Dockerfile
│   │   ├── .env.example
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── app.ts
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── middlewares/
│   │   │   ├── security/
│   │   │   ├── observability/
│   │   │   ├── integrations/
│   │   │   ├── events/
│   │   │   ├── database/
│   │   │   ├── utils/
│   │   │   ├── validators/
│   │   │   ├── dto/
│   │   │   ├── types/
│   │   │   └── docs/
│   │   └── tests/
│   │       ├── unit/
│   │       ├── integration/
│   │       └── e2e/
│   │
│   ├── permission-service/
│   │   └── [Same structure as above]
│   │
│   ├── workflow-definition-service/
│   │   └── [Same structure as above]
│   │
│   ├── workflow-instance-service/
│   │   └── [Same structure as above]
│   │   # Additional: saga/ folder for orchestrating distributed transactions
│   │
│   ├── task-service/
│   │   └── [Same structure as above]
│   │
│   ├── approval-service/
│   │   └── [Same structure as above]
│   │
│   ├── document-service/
│   │   └── [Same structure as above]
│   │   # Additional: storage/ folder for S3/MinIO integration
│   │
│   ├── audit-service/
│   │   └── [Same structure as above]
│   │   # Additional: event-store/ folder for event sourcing
│   │
│   ├── notification-service/
│   │   └── [Same structure as above]
│   │   # Additional: channels/ folder (email, sms, push, webhook)
│   │
│   └── reporting-service/
│       └── [Same structure as above]
│       # Additional: queries/ folder for CQRS read models
│
└── docs/
    ├── architecture/
    │   ├── overview.md
    │   ├── service-communication.md
    │   ├── data-flow.md
    │   └── security-model.md
    ├── api/
    │   ├── v1/
    │   │   └── openapi.yaml
    │   └── v2/
    │       └── .gitkeep
    ├── deployment/
    │   ├── local-setup.md
    │   ├── docker-setup.md
    │   └── kubernetes-setup.md
    └── runbooks/
        ├── incident-response.md
        └── troubleshooting.md
```

## Service Template Details

### Each Microservice Contains:

| Folder | Purpose |
|--------|---------|
| `config/` | Environment-based configuration |
| `controllers/` | HTTP request handlers |
| `services/` | Business logic layer |
| `repositories/` | Data access layer |
| `models/` | Domain models |
| `routes/` | Express route definitions |
| `middlewares/` | Request/response interceptors |
| `security/` | Auth, encryption, validation |
| `observability/` | Logging, metrics, tracing |
| `integrations/` | External service clients |
| `events/` | Kafka producers/consumers |
| `database/` | Prisma client, connection |
| `utils/` | Utility functions |
| `validators/` | Input validation |
| `dto/` | Data transfer objects |
| `types/` | TypeScript type definitions |
| `docs/` | Swagger/OpenAPI schemas |

## Architecture Principles

1. **Database Per Service**: Each service owns its data
2. **Event-Driven Communication**: Kafka for async messaging
3. **API Gateway Pattern**: Single entry point for clients
4. **Circuit Breaker**: Resilience with Opossum
5. **CQRS**: Separate read/write (reporting-service)
6. **Saga Pattern**: Distributed transaction management
7. **Event Sourcing**: Immutable audit trail (audit-service)
