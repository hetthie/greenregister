import {Router} from 'express'; //importar router para definir las rutas

import {crearPlanta} from  '../controllers/plantaControllers.js'

import {authMiddleware} from '../middlewares/authMiddleware.js'

const router = Router();

router.post('/',authMiddleware,crearPlanta);

export default router;