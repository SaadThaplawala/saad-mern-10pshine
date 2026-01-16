const pool = require('../config/database');
const logger = require('../config/logger');

class Note {
  /**
   * Create a new note
   * @param {number} userId - User ID
   * @param {string} title - Note title
   * @param {string} content - Note content
   * @returns {object} Created note
   */
  static async create(userId, title, content) {
    try {
      const query = 'INSERT INTO notes (userId, title, content) VALUES (?, ?, ?)';
      const [result] = await pool.execute(query, [userId, title, content]);
      logger.info(`Note created with ID: ${result.insertId} for user ${userId}`);
      return { id: result.insertId, userId, title, content };
    } catch (error) {
      logger.error('Error creating note:', error);
      throw error;
    }
  }

  /**
   * Get all notes for a user
   * @param {number} userId - User ID
   * @returns {array} Array of notes
   */
  static async findByUserId(userId) {
    try {
      const query = 'SELECT id, userId, title, content, createdAt, updatedAt FROM notes WHERE userId = ? ORDER BY updatedAt DESC';
      const [rows] = await pool.execute(query, [userId]);
      return rows;
    } catch (error) {
      logger.error('Error finding notes by user ID:', error);
      throw error;
    }
  }

  /**
   * Get a specific note by ID
   * @param {number} id - Note ID
   * @param {number} userId - User ID (for authorization)
   * @returns {object} Note object or null
   */
  static async findById(id, userId) {
    try {
      const query = 'SELECT id, userId, title, content, createdAt, updatedAt FROM notes WHERE id = ? AND userId = ?';
      const [rows] = await pool.execute(query, [id, userId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error('Error finding note by ID:', error);
      throw error;
    }
  }

  /**
   * Update a note
   * @param {number} id - Note ID
   * @param {number} userId - User ID (for authorization)
   * @param {object} updates - Fields to update (title, content)
   * @returns {object} Updated note
   */
  static async update(id, userId, updates) {
    try {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      const query = `UPDATE notes SET ${fields}, updatedAt = NOW() WHERE id = ? AND userId = ?`;
      const [result] = await pool.execute(query, [...values, id, userId]);
      
      if (result.affectedRows === 0) {
        return null; // Note not found or unauthorized
      }
      
      logger.info(`Note ${id} updated successfully`);
      return await this.findById(id, userId);
    } catch (error) {
      logger.error('Error updating note:', error);
      throw error;
    }
  }

  /**
   * Delete a note
   * @param {number} id - Note ID
   * @param {number} userId - User ID (for authorization)
   * @returns {boolean} Success status
   */
  static async delete(id, userId) {
    try {
      const query = 'DELETE FROM notes WHERE id = ? AND userId = ?';
      const [result] = await pool.execute(query, [id, userId]);
      
      if (result.affectedRows === 0) {
        return false; // Note not found or unauthorized
      }
      
      logger.info(`Note ${id} deleted successfully`);
      return true;
    } catch (error) {
      logger.error('Error deleting note:', error);
      throw error;
    }
  }

  /**
   * Delete all notes for a user (when user is deleted)
   * @param {number} userId - User ID
   * @returns {boolean} Success status
   */
  static async deleteByUserId(userId) {
    try {
      const query = 'DELETE FROM notes WHERE userId = ?';
      const [result] = await pool.execute(query, [userId]);
      logger.info(`All notes deleted for user ${userId}`);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting notes by user ID:', error);
      throw error;
    }
  }
}

module.exports = Note;
