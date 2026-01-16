const pool = require('../config/database');
const logger = require('../config/logger');

class User {
  /**
   * Create a new user in database
   * @param {string} email - User email
   * @param {string} hashedPassword - Hashed password
   * @returns {object} Created user
   */
  static async create(email, hashedPassword) {
    try {
      const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
      const [result] = await pool.execute(query, [email, hashedPassword]);
      logger.info(`User created with ID: ${result.insertId}`);
      return { id: result.insertId, email };
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {object} User object or null
   */
  static async findByEmail(email) {
    try {
      const query = 'SELECT id, email, password FROM users WHERE email = ?';
      const [rows] = await pool.execute(query, [email]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {object} User object or null
   */
  static async findById(id) {
    try {
      const query = 'SELECT id, email, createdAt, updatedAt FROM users WHERE id = ?';
      const [rows] = await pool.execute(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Update user email or password
   * @param {number} id - User ID
   * @param {object} updates - Fields to update
   * @returns {object} Updated user
   */
  static async update(id, updates) {
    try {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      const query = `UPDATE users SET ${fields}, updatedAt = NOW() WHERE id = ?`;
      await pool.execute(query, [...values, id]);
      logger.info(`User ${id} updated successfully`);
      return await this.findById(id);
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {boolean} Success status
   */
  static async delete(id) {
    try {
      const query = 'DELETE FROM users WHERE id = ?';
      const [result] = await pool.execute(query, [id]);
      logger.info(`User ${id} deleted successfully`);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }
}

module.exports = User;
