import pool from './src/config/db.js'; //importar el pool de la base de datos

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()'); //ejecutar una consulta para obtener la fecha y hora actual
    console.log('contecion exitosa, hora del servidor',result.rows[0].now); //imprimir la fecha y hora actual del servidor
  } catch (error) {
    console.error('error al conectar:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection(); //llamar a la funcion para probar la conexion