import {Router} from 'express'; //importar router para definir las rutas

import {listarCatalogo,obtenerMedicinaPorCatalogo,obtenerComidaPorCatalogo} from  '../controllers/catalogoController.js'

import {authMiddleware} from '../middlewares/authMiddleware.js'

const router = Router();


router.get('/',authMiddleware,listarCatalogo);
router.get('/:id/medicina', authMiddleware, obtenerMedicinaPorCatalogo);
router.get('/:id/comida', authMiddleware, obtenerComidaPorCatalogo);

export default router;