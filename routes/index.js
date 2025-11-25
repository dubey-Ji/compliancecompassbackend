import express from 'express';
import authRoutes from './authRoutes.js';
import onboardingRoutes from './onboardingRoutes.js';
import projectRoutes from './projectRoutes.js';
import integrationRoutes from './integrationRoutes.js';
import * as healthController from '../controllers/healthController.js';

const router = express.Router();

// Health check
router.get('/health', healthController.healthCheck);

// API info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Compliance Compass API',
    version: '1.0.0',
  });
});

// Auth routes
router.use('/auth', authRoutes);

// Onboarding routes
router.use('/onboarding', onboardingRoutes);

// Project routes
router.use('/projects', projectRoutes);

// Integration routes
router.use('/integrations', integrationRoutes);

export default router;

