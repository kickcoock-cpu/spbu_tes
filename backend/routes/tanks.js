const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  createTank, 
  getTanks, 
  getTank, 
  updateTank, 
  deleteTank 
} = require('../controllers/tankController');
const { authorize } = require('../middleware/rbac');

// Routes for tanks
router.route('/')
  .post(protect, (req, res, next) => {
    console.log('POST /api/tanks route accessed');
    next();
  }, authorize('Super Admin'), createTank)
  .get(protect, (req, res, next) => {
    console.log('GET /api/tanks route accessed');
    next();
  }, authorize('Super Admin', 'Admin', 'Operator'), getTanks);

router.route('/:id')
  .get(protect, (req, res, next) => {
    console.log('GET /api/tanks/:id route accessed, ID:', req.params.id);
    next();
  }, authorize('Super Admin', 'Admin', 'Operator'), getTank)
  .put(protect, (req, res, next) => {
    console.log('PUT /api/tanks/:id route accessed, ID:', req.params.id);
    next();
  }, authorize('Super Admin'), updateTank)
  .delete(protect, (req, res, next) => {
    console.log('DELETE /api/tanks/:id route accessed, ID:', req.params.id);
    next();
  }, authorize('Super Admin'), deleteTank);

module.exports = router;