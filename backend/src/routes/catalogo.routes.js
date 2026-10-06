import {Router} from 'express'; //importar router para definir las rutas

import {listarCatalogo,obtenerMedicinaPorCatalogo,obtenerComidaPorCatalogo,obtenerHorticulturaPorCatalogo,obtenerCatalogo} from  '../controllers/catalogoController.js'

import {authMiddleware} from '../middlewares/authMiddleware.js'
import { validarParametroId } from '../middlewares/validationMiddleware.js';

const router = Router();


router.get('/',authMiddleware,listarCatalogo);
router.get('/:id',authMiddleware,obtenerCatalogo);
router.get('/:id/medicina', authMiddleware, validarParametroId, obtenerMedicinaPorCatalogo);
router.get('/:id/comida', authMiddleware, validarParametroId, obtenerComidaPorCatalogo);
router.get('/:id/horticultura', authMiddleware, validarParametroId, obtenerHorticulturaPorCatalogo);
export default router;
