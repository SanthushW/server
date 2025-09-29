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
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;


