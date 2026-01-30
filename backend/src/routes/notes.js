const express = require('express');
const { getAllNotes, createNote, updateNote, deleteNote } = require('../controllers/notesController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/notes
 * @desc    Get all notes for authenticated user
 * @auth    Required (Bearer token)
 * @returns { notes[] }
 */
router.get('/', verifyToken, getAllNotes);

/**
 * @route   POST /api/notes
 * @desc    Create a new note
 * @auth    Required (Bearer token)
 * @body    { title, content }
 * @returns { note }
 */
router.post('/', verifyToken, createNote);

/**
 * @route   PUT /api/notes/:id
 * @desc    Update a note
 * @auth    Required (Bearer token)
 * @params  { id }
 * @body    { title?, content? }
 * @returns { note }
 */
router.put('/:id', verifyToken, updateNote);

/**
 * @route   DELETE /api/notes/:id
 * @desc    Delete a note
 * @auth    Required (Bearer token)
 * @params  { id }
 * @returns { message }
 */
router.delete('/:id', verifyToken, deleteNote);

module.exports = router;
