import pkg from 'pg'; // importe de pg
import dotenv from 'dotenv';//para llamada de datos .env

dotenv.config();//carga de variables de entorno

const { Pool } = pkg;// se extrae clase pool de pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // se obtiene la url de la base de datos desde el archivo .env
  ssl: {
    rejectUnauthorized: false, // se desactiva la verificación del certificado SSL
  },
});

export default pool; // se exporta el objeto pool para ser utilizado en otros archivos