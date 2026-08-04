import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import pool, { checkDbConnection } from './config/db.js';
import { verifyAuth } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_pre_ordering_app_2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use(verifyAuth);

// Helper to generate short unique order ID
const generateOrderId = () => `ORD-${Date.now().toString().slice(-6)}`;

// Helper to sign JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ─────────────────────────────────────────────
// 1. GET /api/health
// ─────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const dbOk = await checkDbConnection();
  res.json({
    status: 'ok',
    server: 'running',
    database: dbOk ? 'MySQL Connected' : 'Disconnected',
  });
});

// ─────────────────────────────────────────────
// 2. GET /api/menu
// ─────────────────────────────────────────────
app.get('/api/menu', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, category, name, price, description, image FROM menu_items ORDER BY category, id'
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('[GET /api/menu]', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch menu items' });
  }
});

// ─────────────────────────────────────────────
// 3. AUTHENTICATION ENDPOINTS
// ─────────────────────────────────────────────

// POST /api/auth/signup - Register new user with email & password
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and full name are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
      });
    }

    // Check if email already exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user into MySQL
    const [result] = await pool.execute(
      `INSERT INTO users (email, password_hash, full_name, phone) VALUES (?, ?, ?, ?)`,
      [email, password_hash, full_name, phone || null]
    );

    const user = {
      id: result.insertId,
      email,
      full_name,
      phone: phone || null,
      role: 'customer',
    };

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user,
    });
  } catch (err) {
    console.error('[POST /api/auth/signup]', err.message);
    res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login - Authenticate user with email & password
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Find user by email
    const [rows] = await pool.execute(
      'SELECT id, email, password_hash, full_name, phone, role FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const userProfile = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
    };

    const token = generateToken(userProfile);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: userProfile,
    });
  } catch (err) {
    console.error('[POST /api/auth/login]', err.message);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
});

// GET /api/auth/me - Retrieve profile for authenticated user
app.get('/api/auth/me', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('[GET /api/auth/me]', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch user profile' });
  }
});

// ─────────────────────────────────────────────
// 4. POST /api/orders
// ─────────────────────────────────────────────
app.post('/api/orders', async (req, res) => {
  const { user_id, items, pickupTime, notes, totalAmount } = req.body;

  const targetUserId = req.user ? req.user.id : user_id;

  if (!targetUserId) {
    return res.status(400).json({ success: false, error: 'user_id is required' });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'items array cannot be empty' });
  }
  if (totalAmount === undefined || totalAmount === null) {
    return res.status(400).json({ success: false, error: 'totalAmount is required' });
  }

  const orderId = generateOrderId();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.execute(
      `INSERT INTO orders (order_id, user_id, pickup_time, notes, total_amount, status)
       VALUES (?, ?, ?, ?, ?, 'Received')`,
      [
        orderId,
        targetUserId,
        pickupTime || null,
        notes || null,
        totalAmount,
      ]
    );

    for (const item of items) {
      await connection.execute(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.id, item.quantity, item.price]
      );
    }

    await connection.commit();
    console.log(`[POST /api/orders] Order placed — ID: ${orderId}, user_id: ${targetUserId}`);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderId,
        userId: targetUserId,
        pickupTime: pickupTime || null,
        notes: notes || null,
        totalAmount,
        status: 'Received',
        items,
      },
    });
  } catch (err) {
    await connection.rollback();
    console.error('[POST /api/orders] Transaction rolled back:', err.message);
    res.status(500).json({ success: false, error: 'Failed to place order. Transaction rolled back.' });
  } finally {
    connection.release();
  }
});

// ─────────────────────────────────────────────
// 5. GET /api/orders
// ─────────────────────────────────────────────
app.get('/api/orders', async (req, res) => {
  try {
    const [orderRows] = await pool.query(`
      SELECT
        o.order_id     AS orderId,
        o.status,
        o.pickup_time  AS pickupTime,
        o.notes,
        o.total_amount AS totalAmount,
        o.created_at   AS createdAt,
        u.id           AS userId,
        u.email,
        u.full_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    if (orderRows.length === 0) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const orderIds = orderRows.map((o) => o.orderId);
    const [itemRows] = await pool.query(
      `SELECT
         oi.order_id     AS orderId,
         oi.menu_item_id AS menuItemId,
         mi.name         AS name,
         oi.quantity,
         oi.price
       FROM order_items oi
       LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE oi.order_id IN (?)`,
      [orderIds]
    );

    const itemsByOrder = {};
    for (const item of itemRows) {
      if (!itemsByOrder[item.orderId]) itemsByOrder[item.orderId] = [];
      itemsByOrder[item.orderId].push({
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
      });
    }

    const data = orderRows.map((o) => ({
      orderId: o.orderId,
      status: o.status,
      pickupTime: o.pickupTime,
      notes: o.notes,
      totalAmount: parseFloat(o.totalAmount),
      createdAt: o.createdAt,
      user: {
        id: o.userId,
        email: o.email,
        full_name: o.full_name,
      },
      items: itemsByOrder[o.orderId] || [],
    }));

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('[GET /api/orders]', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// Start server
const server = app.listen(PORT, async () => {
  const dbOk = await checkDbConnection();
  console.log('=============================================');
  console.log(`🚀  Server running  →  http://localhost:${PORT}`);
  console.log(`🗄️   Database       →  ${dbOk ? '🟢 MySQL Connected' : '🔴 Disconnected'}`);
  console.log('📡  Endpoints:');
  console.log(`   GET    /api/health`);
  console.log(`   GET    /api/menu`);
  console.log(`   POST   /api/auth/signup`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/auth/me`);
  console.log(`   POST   /api/orders`);
  console.log(`   GET    /api/orders`);
  console.log('=============================================');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n⚠️  Port ${PORT} is already in use.`);
  } else {
    console.error('Server error:', err);
  }
});
