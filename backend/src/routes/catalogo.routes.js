import {Router} from 'express'; //importar router para definir las rutas

import {listarCatalogo,obtenerMedicinaPorCatalogo,obtenerComidaPorCatalogo,obtenerHorticulturaPorCatalogo,obtenerCatalogo} from  '../controllers/catalogoController.js'

import {authMiddleware} from '../middlewares/authMiddleware.js'

const router = Router();


router.get('/',authMiddleware,listarCatalogo);
router.get('/:id',authMiddleware,obtenerCatalogo);
router.get('/:id/medicina', authMiddleware, obtenerMedicinaPorCatalogo);
router.get('/:id/comida', authMiddleware, obtenerComidaPorCatalogo);
router.get('/:id/horticultura', authMiddleware, obtenerHorticulturaPorCatalogo);
export default router;
