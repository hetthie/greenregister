import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'aws-1-sa-east-1.pooler.supabase.com',
  database: 'postgres',
  user: 'postgres.dxtukqkfvljyjugluqjf',
  password: 'AMBHhhg2002*',
  port: 6543,
  ssl: false
});

console.log('Conectando a Supabase...');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error:', err.message);
  } else {
    console.log('✅ Conectado! Hora del servidor:', res.rows[0]);
  }
  pool.end();
});