import {Router} from 'express'; //importar router para definir las rutas

import {crearPlanta,listarPlantas} from  '../controllers/plantaControllers.js'

import {authMiddleware} from '../middlewares/authMiddleware.js'

const router = Router();

router.post('/',authMiddleware,crearPlanta);
router.post('/',authMiddleware,listarPlantas);

export default router;