import express from "express"; //creacion de servidos-rutas
import dotenv from "dotenv"; // coneccion a otros origenes (front) a esta api
import cors from "cors";//ver variables del archivo .env
import authRoutes from './src/routes/auth.routes.js';
import plantaRoutes from './src/routes/planta.routes.js';
import catalogoRoutes from './src/routes/catalogo.routes.js';

dotenv.config(); //variables de entorno

const app = express(); //creacion de servidor

const PORT = process.env.PORT || 3000; //puerto de escucha

app.use(cors()); //habilitar cors en todas las rutas

app.use(express.json()); //habilitar el parseo de json en todas las rutas

app.get("/", (req, res) => {
  res.send("Hello World!");//ruta de pruea para saber si funciono 
});

app.use('/auth', authRoutes); //usar las rutas de autenticacion
app.use('/plantas',plantaRoutes)
app.use('/catalogo',catalogoRoutes)

app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});//levata servidor y escucha las interfaces en el puerto definido
