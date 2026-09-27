import {Router} from 'express'; //importar router para definir las rutas

import { register,login } from '../controllers/authController.js'; //importar la funcion de registro de usuario

//se crea la instancia router
const router = Router();

//ruta para el registro de usuario
router.post('/register', register);
router.post('/login', login);

export default router; //exportar el router para ser utilizado en server.js