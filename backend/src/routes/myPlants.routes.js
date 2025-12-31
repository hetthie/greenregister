import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { 
  getMyPlants, 
  getMyPlant, 
  addMyPlant, 
  deleteMyPlant 
} from '../controllers/myPlantsController.js';

const router = express.Router();

router.get('/my-plants', authMiddleware, getMyPlants);
router.get('/my-plants/:id', authMiddleware, getMyPlant);
router.post('/my-plants', authMiddleware, addMyPlant);
router.delete('/my-plants/:id', authMiddleware, deleteMyPlant);

export default router;