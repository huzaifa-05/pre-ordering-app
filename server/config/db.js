import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env variables from server/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const getDatabaseSecret = async () => {
  if (!process.env.DB_SECRET_ARN) return {};

  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
  const client = new SecretsManagerClient({ region });
  const response = await client.send(new GetSecretValueCommand({
    SecretId: process.env.DB_SECRET_ARN,
  }));

  return response.SecretString ? JSON.parse(response.SecretString) : {};
};

const secret = await getDatabaseSecret().catch((err) => {
  console.warn('Could not load database secret:', err.message);
  return {};
});

const dbConfig = {
  host: process.env.DB_HOST || secret.host || 'localhost',
  port: parseInt(process.env.DB_PORT || secret.port || '3306', 10),
  user: secret.username || process.env.DB_USER || 'root',
  password: secret.password || process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || secret.dbname || 'pre_ordering_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 2000,
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
  } catch {
    isDbConnected = false;
    return false;
  }
};

export const getPool = () => pool;
export const getIsDbConnected = () => isDbConnected;

export default pool;
