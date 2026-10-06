import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import plantaRoutes from './routes/planta.routes.js';
import catalogoRoutes from './routes/catalogo.routes.js';
import { rutaNoEncontrada, errorMiddleware } from './middlewares/errorMiddleware.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.get('/', (req, res) => res.send('Hello World!'));
app.use('/auth', authRoutes);
app.use('/plantas', plantaRoutes);
app.use('/catalogo', catalogoRoutes);
app.use(rutaNoEncontrada);
app.use(errorMiddleware);
export default app;
