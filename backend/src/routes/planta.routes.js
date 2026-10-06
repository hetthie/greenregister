import {Router} from 'express'; //importar router para definir las rutas

import {crearPlanta,listarPlantas,actualizarPlanta,obtenerPlanta,eliminarPlanta} from  '../controllers/plantaControllers.js'

import {authMiddleware} from '../middlewares/authMiddleware.js'
import { validarPlanta, validarParametroId } from '../middlewares/validationMiddleware.js';

const router = Router();

router.post('/',authMiddleware,validarPlanta(true),crearPlanta);
router.get('/',authMiddleware,listarPlantas);
router.get('/:id',authMiddleware,obtenerPlanta);
router.delete('/:id',authMiddleware,eliminarPlanta);
router.put('/:id',authMiddleware,validarParametroId,validarPlanta(),actualizarPlanta)

export default router;
