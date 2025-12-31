import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

console.log('Conectando con:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT
});

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: false
});

console.log('Intentando conectar a Supabase...');

pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'', (err, res) => {
  if (err) {
    console.error(' Error:', err.message);
  } else {
    console.log(' Tablas encontradas:', res.rows);
  }
  pool.end();
});