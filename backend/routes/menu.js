const express = require('express');
const router = express.Router();
const { getMenu } = require('../controllers/menuController');
const { protect } = require('../middleware/auth');

// Route to get menu structure based on user role
router.route('/').get(protect, getMenu);

module.exports = router;