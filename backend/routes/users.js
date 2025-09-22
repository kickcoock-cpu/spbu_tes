const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  registerUser,
  loginUser,
  getMe,
  getUsers,
  getOperators,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
  changePassword,
  changeEmail,
  deleteAccount
} = require('../controllers/userController');

// Public routes
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/me/password', protect, changePassword);
router.put('/me/email', protect, changeEmail);
router.delete('/me', protect, deleteAccount);

// Super Admin routes
router.route('/')
  .post(protect, authorize('Super Admin'), registerUser)
  .get(protect, authorize('Super Admin', 'Admin'), getUsers);

// Route to get operators only
router.route('/operators')
  .get(protect, authorize('Super Admin', 'Admin'), getOperators);

// Individual user routes (protected)
router.route('/:id')
  .get(protect, authorize('Super Admin', 'Admin'), getUser)
  .put(protect, authorize('Super Admin'), updateUser)
  .delete(protect, authorize('Super Admin'), deleteUser);

module.exports = router;