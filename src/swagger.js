import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Real-Time Bus Tracking API',
      version: '1.0.0',
      description: 'API for the National Transport Commission of Sri Lanka. Provides CRUD for routes, buses, and trips; JWT-protected write operations; Server-Sent Events for real-time bus updates.',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        // Device authentication via header (API key-like). Use value: "Device <deviceId>:<secret>"
        deviceAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Device auth header. Format: "Device <deviceId>:<secret>".\n\nExamples:\n- Legacy device header to paste into Authorize: Device device-101:dev_secret_device_101\n- Bearer token to paste into Authorize (select Bearer): Bearer <JWT_TOKEN_HERE>\n\nIn Swagger UI Authorize dialog, paste the full header value above (including the "Device " or "Bearer " prefix).',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            username: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'operator', 'viewer'] },
          },
        },
        UserRegister: {
          type: 'object',
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
          },
          required: ['username', 'password'],
        },
        UserLogin: {
          type: 'object',
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
          },
          required: ['username', 'password'],
        },
        UserCreate: {
          type: 'object',
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'operator', 'viewer'] },
          },
          required: ['username', 'password', 'role'],
        },
        Bus: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            routeId: { type: 'integer' },
            plate: { type: 'string' },
            status: { type: 'string', enum: ['active', 'inactive', 'maintenance'] },
            gps: {
              type: 'object',
              properties: { lat: { type: 'number' }, lng: { type: 'number' } },
            },
          },
        },
        BusCreate: {
          type: 'object',
          properties: {
            routeId: { type: 'integer' },
            plate: { type: 'string' },
            status: { type: 'string', enum: ['active', 'inactive', 'maintenance'] },
            gps: { type: 'object', properties: { lat: { type: 'number' }, lng: { type: 'number' } } },
          },
          required: ['routeId', 'plate'],
        },
        Trip: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            busId: { type: 'integer' },
            routeId: { type: 'integer' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['scheduled', 'in-progress', 'completed', 'cancelled'] },
          },
        },
        TripCreate: {
          type: 'object',
          properties: {
            busId: { type: 'integer' },
            routeId: { type: 'integer' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['scheduled', 'in-progress', 'completed', 'cancelled'] },
          },
          required: ['busId', 'routeId', 'startTime', 'endTime'],
        },
      },
    },
  // Default security requirements (APIs that require user JWTs). Individual endpoints
  // can also reference the `deviceAuth` scheme where appropriate.
  security: [{ bearerAuth: [] }],
  },
  // Reusable examples for request payloads and headers
  examples: {
    DeviceHeaderExample: {
      summary: 'Device header example',
      value: 'Device device-101:dev_secret_device_101'
    },
    BearerHeaderExample: {
      summary: 'Bearer token example',
      value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    },
    IngestGpsExample: {
      summary: 'Sample GPS payload',
      value: {
        busId: 101,
        timestamp: '2025-10-03T12:00:00Z',
        lat: 6.9271,
        lng: 79.8612,
        speed: 40
      }
    }
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;


