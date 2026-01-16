const mysql = require('mysql2/promise');
const logger = require('./logger');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'notes_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection()
  .then(connection => {
    logger.info('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    logger.error('❌ Database connection failed:', err);
    process.exit(1);
  });

module.exports = pool;
