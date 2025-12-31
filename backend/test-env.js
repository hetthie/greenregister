console.log('=== TEST VARIABLES DE ENTORNO ===');
console.log('DB_HOST:', process.env.DB_HOST || 'NO DEFINIDA');
console.log('DB_NAME:', process.env.DB_NAME || 'NO DEFINIDA');
console.log('DB_USER:', process.env.DB_USER || 'NO DEFINIDA');
console.log('DB_PORT:', process.env.DB_PORT || 'NO DEFINIDA');

// Ahora con dotenv
import dotenv from 'dotenv';
dotenv.config();

console.log('\n=== CON DOTENV ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PORT:', process.env.DB_PORT);