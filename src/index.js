import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import prisma from './utils/prisma.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { swaggerSpec } from './config/swagger.js';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/authRoutes.js';
import tournamentRoutes from './routes/tournamentRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Frontend Routes
app.get('/', (req, res) => {
  res.render('pages/accueil');
});

app.get('/tournois', (req, res) => {
  res.render('pages/tournois');
});

app.get('/equipes', (req, res) => {
  res.render('pages/equipes');
});

app.get('/connexion', (req, res) => {
  res.render('pages/connexion');
});

app.get('/profil', (req, res) => {
  res.render('pages/profil');
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tournaments/:tournamentId/registrations', registrationRoutes);
app.use('/api/tournaments/:tournamentId/stats', statsRoutes);
app.use('/api/tournaments/:tournamentId/register', (req, res, next) => {
  // Forward to registration route with POST
  if (req.method === 'POST') {
    registrationRoutes(req, res, next);
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      status: 404,
      message: 'Route not found',
    },
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📖 API Health: http://localhost:${PORT}/api/health`);
      console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
