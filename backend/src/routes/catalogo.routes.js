import {Router} from 'express'; //importar router para definir las rutas

import {listarCatalogo} from  '../controllers/catalogoController.js'

import {authMiddleware} from '../middlewares/authMiddleware.js'

const router = Router();


router.get('/',authMiddleware,listarCatalogo);

export default router;