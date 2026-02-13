// ============================================
// Swagger/OpenAPI Configuration
// ============================================

import type { SwaggerOptions } from 'swagger-ui-express';

export const swaggerConfig = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Enterprise Workflow Management System API',
      version: '1.0.0',
      description: `
## Overview
Enterprise-grade Workflow Management System API providing comprehensive workflow automation, 
task management, and approval processing capabilities.

## Authentication
All API endpoints (except /auth/*) require JWT Bearer token authentication.

### Obtaining Tokens
1. POST /api/v1/auth/login with credentials
2. Use the returned access_token in Authorization header
3. Refresh tokens using POST /api/v1/auth/refresh

## Rate Limiting
- Global: 100 requests per 15 minutes
- Auth endpoints: 10 requests per 15 minutes
- API endpoints: 60 requests per minute

## Error Codes
| Code | Description |
|------|-------------|
| ERR_1xxx | General errors |
| ERR_2xxx | Authentication errors |
| ERR_3xxx | Authorization errors |
| ERR_4xxx | User errors |
| ERR_5xxx | Workflow errors |
| ERR_6xxx | Task errors |
| ERR_7xxx | Approval errors |
| ERR_8xxx | Document errors |
| ERR_9xxx | Rate limiting errors |
      `,
      contact: {
        name: 'API Support',
        email: 'support@workflow-system.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.workflow-system.com',
        description: 'Production server',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Workflows', description: 'Workflow definition and instance endpoints' },
      { name: 'Tasks', description: 'Task management endpoints' },
      { name: 'Approvals', description: 'Approval processing endpoints' },
      { name: 'Documents', description: 'Document management endpoints' },
      { name: 'Notifications', description: 'Notification endpoints' },
      { name: 'Reports', description: 'Reporting endpoints' },
      { name: 'Health', description: 'Health check endpoints' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for service-to-service communication',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'ERR_1001' },
                message: { type: 'string', example: 'Validation failed' },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
            timestamp: { type: 'string', format: 'date-time' },
            correlationId: { type: 'string', format: 'uuid' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'integer', example: 1 },
            itemsPerPage: { type: 'integer', example: 20 },
            totalItems: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 5 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        Forbidden: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        RateLimitExceeded: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/**/*.ts', './src/docs/**/*.ts'],
};

export const swaggerUiOptions: SwaggerOptions = {
  explorer: true,
  customSiteTitle: 'Workflow API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  },
};
