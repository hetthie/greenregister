import dotenv from 'dotenv'; //tokens para  env

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
export const JWT_EXPIRES_IN = '24h';