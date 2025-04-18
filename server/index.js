import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import jwt from 'jsonwebtoken';
import initModels from './models/index.js';
import systemRoutes from './routes/systems.js';
import questionRoutes from './routes/questions.js';
import authRoutes from './routes/auth.js';
import progressRoutes from './routes/progress.js';
import auth from './middleware/auth.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false,
});

// Initialize models
const models = initModels(sequelize);

// Authenticate with database
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/systems', auth, systemRoutes);
app.use('/api/questions', auth, questionRoutes);
app.use('/api/progress', auth, progressRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;