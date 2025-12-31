import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getPlantActivities, createActivity } from '../controllers/activitiesController.js';

const router = express.Router();

router.get('/activities/:plant_id', authMiddleware, getPlantActivities);
router.post('/activities', authMiddleware, createActivity);

export default router;