import {Router} from 'express'; //importar router para definir las rutas

import {listarCatalogo,obtenerMedicinaPorCatalogo} from  '../controllers/catalogoController.js'

import {authMiddleware} from '../middlewares/authMiddleware.js'

const router = Router();


router.get('/',authMiddleware,listarCatalogo);
router.get('/:id/medicina', authMiddleware, obtenerMedicinaPorCatalogo);

export default router;