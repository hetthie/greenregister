import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.routes.js';
import catalogRoutes from './src/routes/catalog.routes.js';
import myPlantsRoutes from './src/routes/myPlants.routes.js';
import activitiesRoutes from './src/routes/activities.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: ' GreenRegister API funcionando' });
});

app.use('/api/auth', authRoutes);
app.use('/api', catalogRoutes);
app.use('/api', myPlantsRoutes);
app.use('/api', activitiesRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
});