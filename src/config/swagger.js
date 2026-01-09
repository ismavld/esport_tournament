import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Esport Tournament API',
      version: '1.0.0',
      description: 'API REST complète pour la gestion de tournois e-sport',
      contact: {
        name: 'Esport API Support',
        url: 'https://github.com/ismavld/esport_tournament',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            username: { type: 'string' },
            role: { type: 'string', enum: ['PLAYER', 'ORGANIZER', 'ADMIN'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Tournament: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            game: { type: 'string' },
            format: { type: 'string', enum: ['SOLO', 'TEAM'] },
            maxParticipants: { type: 'integer' },
            prizePool: { type: 'number' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['DRAFT', 'OPEN', 'ONGOING', 'COMPLETED', 'CANCELLED'] },
            organizerId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Team: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            tag: { type: 'string' },
            captainId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Registration: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            tournamentId: { type: 'integer' },
            playerId: { type: 'integer', nullable: true },
            teamId: { type: 'integer', nullable: true },
            status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'REJECTED', 'WITHDRAWN'] },
            registeredAt: { type: 'string', format: 'date-time' },
            confirmedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                status: { type: 'integer' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        Unauthorized: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        Forbidden: {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        NotFound: {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        Conflict: {
          description: 'Conflict',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        InternalServerError: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
