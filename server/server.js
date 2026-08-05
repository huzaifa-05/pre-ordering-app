import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool, { checkDbConnection, getIsDbConnected } from './config/db.js';
import { requireAuth, verifyAuth } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const MENU_JSON_PATH = path.join(__dirname, 'data', 'menu.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(verifyAuth);

// Helper to generate short unique order ID
const generateOrderId = () => `ORD-${Date.now().toString().slice(-6)}`;

const getLocalMenu = () => JSON.parse(fs.readFileSync(MENU_JSON_PATH, 'utf8'));

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
    if (!pool || !getIsDbConnected()) {
      const menu = getLocalMenu();
      return res.json({ success: true, count: menu.length, source: 'local-fallback', data: menu });
    }

    const [rows] = await pool.query(
      'SELECT id, category, name, price, description, image FROM menu_items ORDER BY category, id'
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.warn('[GET /api/menu] Using local menu fallback:', err.message);
    const menu = getLocalMenu();
    res.json({ success: true, count: menu.length, source: 'local-fallback', data: menu });
  }
});

// ─────────────────────────────────────────────
// 3. AUTHENTICATION ENDPOINTS
// ─────────────────────────────────────────────

// GET /api/auth/me - Retrieve profile for authenticated user
app.get('/api/auth/me', requireAuth, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// ─────────────────────────────────────────────
// 4. POST /api/orders
// ─────────────────────────────────────────────
app.post('/api/orders', requireAuth, async (req, res) => {
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
app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    const [orderRows] = await pool.query(`
      SELECT
        o.order_id     AS orderId,
        o.status,
        o.pickup_time  AS pickupTime,
        o.notes,
        o.total_amount AS totalAmount,
        o.created_at   AS createdAt,
        o.user_id       AS userId
      FROM orders o
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
        email: null,
        full_name: o.userId,
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
