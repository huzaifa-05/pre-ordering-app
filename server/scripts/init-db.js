import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function initDatabase() {
  console.log("======================================");
  console.log(" Initializing Pre-Ordering Database");
  console.log("======================================");

  const config = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  };

  const dbName = process.env.DB_NAME || "pre_ordering_db";

  let server;
  let db;

  try {
    // Connect to MySQL Server
    server = await mysql.createConnection(config);
    console.log("✅ Connected to MySQL Server");

    // Create Database
    await server.query(`
      CREATE DATABASE IF NOT EXISTS \`${dbName}\`
      CHARACTER SET utf8mb4
      COLLATE utf8mb4_unicode_ci;
    `);

    console.log(`✅ Database '${dbName}' is ready`);

    await server.end();

    // Connect to Database
    db = await mysql.createConnection({
      ...config,
      database: dbName,
    });

    console.log(`✅ Connected to '${dbName}'`);

    // Read Schema
    const schemaPath = path.join(__dirname, "schema.sql");

    let sql = fs.readFileSync(schemaPath, "utf8");

    // Remove SQL comments
    sql = sql.replace(/^--.*$/gm, "");

    // Remove blank lines
    sql = sql.replace(/^\s*[\r\n]/gm, "");

    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length);

    console.log(`\nFound ${statements.length} SQL statements\n`);

    // Execute each statement
    for (const statement of statements) {
      console.log("--------------------------------");
      console.log(statement.substring(0, 80) + "...");
      console.log("--------------------------------");

      await db.query(statement);
    }

    console.log("\n✅ Tables created successfully.");

    // ------------------------------------------------------------
    // Load seed data from seed.sql (roles, categories, statuses)
    // ------------------------------------------------------------
    const seedPath = path.join(__dirname, "seed.sql");
    let seedSql = fs.readFileSync(seedPath, "utf8");
    seedSql = seedSql.replace(/^--.*$/gm, "");
    seedSql = seedSql.replace(/^\s*[\r\n]/gm, "");
    const seedStatements = seedSql
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length);
    console.log(`\nFound ${seedStatements.length} seed statements`);
    for (const stmt of seedStatements) {
      console.log("--- seed ---");
      console.log(stmt.substring(0, 80) + "...");
      await db.query(stmt);
    }
    console.log("\n✅ Seed data inserted successfully.");

    // Verify Tables
    const [tables] = await db.query("SHOW TABLES");

    console.log("\nExisting Tables:");

    if (tables.length === 0) {
      throw new Error("No tables were created.");
    }

    console.table(tables);

    // Read menu.json
    const menuPath = path.join(__dirname, "..", "data", "menu.json");

    const menu = JSON.parse(fs.readFileSync(menuPath, "utf8"));

    console.log(`\nImporting ${menu.length} menu items...\n`);

    for (const item of menu) {
      await db.execute(
        `
        INSERT INTO menu_items
        (id, category, name, price, description, image)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          category = VALUES(category),
          name = VALUES(name),
          price = VALUES(price),
          description = VALUES(description),
          image = VALUES(image)
      `,
        [
          item.id,
          item.category,
          item.name,
          item.price,
          item.description,
          item.image,
        ]
      );
    }

    console.log("✅ Menu imported successfully.");

    console.log("\n🎉 Database initialization completed.");
  } catch (err) {
    console.error("\n❌ Initialization Failed");
    console.error(err);
  } finally {
    if (db) await db.end().catch(() => { });
    if (server) await server.end().catch(() => { });
  }
}

initDatabase();