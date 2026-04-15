const express = require('express');
const { createTicket, getTickets, updateTicket } = require('../controllers/supportController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', createTicket);                              // public
router.get('/', protect, adminOnly, getTickets);            // admin only
router.put('/:id', protect, adminOnly, updateTicket);       // admin only

module.exports = router;
