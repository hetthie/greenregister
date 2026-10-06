import {Router} from 'express'; //importar router para definir las rutas

import {crearPlanta,listarPlantas,actualizarPlanta,obtenerPlanta,eliminarPlanta} from  '../controllers/plantaControllers.js'

import {authMiddleware} from '../middlewares/authMiddleware.js'

const router = Router();

router.post('/',authMiddleware,crearPlanta);
router.get('/',authMiddleware,listarPlantas);
router.get('/:id',authMiddleware,obtenerPlanta);
router.delete('/:id',authMiddleware,eliminarPlanta);
router.put('/:id',authMiddleware,actualizarPlanta)

export default router;
