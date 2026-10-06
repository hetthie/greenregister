import {Router} from 'express'; //importar router para definir las rutas

import {crearPlanta,listarPlantas,actualizarPlanta,obtenerPlanta} from  '../controllers/plantaControllers.js'

import {authMiddleware} from '../middlewares/authMiddleware.js'

const router = Router();

router.post('/',authMiddleware,crearPlanta);
router.get('/',authMiddleware,listarPlantas);
router.get('/:id',authMiddleware,obtenerPlanta);
router.put('/:id',authMiddleware,actualizarPlanta)

export default router;
