const Note = require('../models/Note');
const logger = require('../config/logger');

/**
 * Get all notes for authenticated user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getAllNotes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notes = await Note.findByUserId(userId);
    
    logger.info(`Fetched ${notes.length} notes for user ${userId}`);
    return res.status(200).json({
      success: true,
      message: 'Notes retrieved successfully',
      data: notes
    });
  } catch (error) {
    logger.error('Error fetching notes:', error);
    next(error);
  }
};

/**
 * Create a new note
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    // Validation
    if (!title || !content) {
      logger.warn('Create note attempt with missing fields');
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Trim and validate title length
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0 || trimmedTitle.length > 255) {
      logger.warn('Create note attempt with invalid title length');
      return res.status(400).json({
        success: false,
        message: 'Title must be between 1 and 255 characters'
      });
    }

    // Create note
    const newNote = await Note.create(userId, trimmedTitle, content);
    
    logger.info(`Note created: ${newNote.id} for user ${userId}`);
    return res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: newNote
    });
  } catch (error) {
    logger.error('Error creating note:', error);
    next(error);
  }
};

/**
 * Update a note
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;

    // Validation
    if (!id) {
      logger.warn('Update note attempt without note ID');
      return res.status(400).json({
        success: false,
        message: 'Note ID is required'
      });
    }

    if (!title && !content) {
      logger.warn('Update note attempt with no fields to update');
      return res.status(400).json({
        success: false,
        message: 'At least title or content must be provided'
      });
    }

    // Build update object
    const updates = {};
    if (title !== undefined) {
      const trimmedTitle = title.trim();
      if (trimmedTitle.length === 0 || trimmedTitle.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Title must be between 1 and 255 characters'
        });
      }
      updates.title = trimmedTitle;
    }
    if (content !== undefined) {
      updates.content = content;
    }

    // Check if note exists and belongs to user
    const existingNote = await Note.findById(id, userId);
    if (!existingNote) {
      logger.warn(`Update attempt on non-existent or unauthorized note: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Note not found or unauthorized'
      });
    }

    // Update note
    const updatedNote = await Note.update(id, userId, updates);
    
    logger.info(`Note updated: ${id} for user ${userId}`);
    return res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: updatedNote
    });
  } catch (error) {
    logger.error('Error updating note:', error);
    next(error);
  }
};

/**
 * Delete a note
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validation
    if (!id) {
      logger.warn('Delete note attempt without note ID');
      return res.status(400).json({
        success: false,
        message: 'Note ID is required'
      });
    }

    // Check if note exists and belongs to user
    const existingNote = await Note.findById(id, userId);
    if (!existingNote) {
      logger.warn(`Delete attempt on non-existent or unauthorized note: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Note not found or unauthorized'
      });
    }

    // Delete note
    const deleted = await Note.delete(id, userId);
    
    if (!deleted) {
      logger.warn(`Failed to delete note: ${id}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete note'
      });
    }

    logger.info(`Note deleted: ${id} for user ${userId}`);
    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting note:', error);
    next(error);
  }
};

module.exports = {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote
};
