import express from 'express';
import { getCatalog, getCatalogPlant } from '../controllers/catalogController.js';

const router = express.Router();

router.get('/catalog', getCatalog);
router.get('/catalog/:id', getCatalogPlant);

export default router;