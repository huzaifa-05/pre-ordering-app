import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env variables from server/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pre_ordering_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool = null;
let isDbConnected = false;

try {
  pool = mysql.createPool(dbConfig);
} catch (err) {
  console.warn('⚠️ Could not initialize MySQL pool:', err.message);
}

// Check database connection asynchronously
export const checkDbConnection = async () => {
  if (!pool) return false;
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    isDbConnected = true;
    return true;
  } catch (error) {
    isDbConnected = false;
    return false;
  }
};

export const getPool = () => pool;
export const getIsDbConnected = () => isDbConnected;

export default pool;
