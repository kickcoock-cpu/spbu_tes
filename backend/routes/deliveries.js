const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const {
  createDelivery,
  getDeliveries,
  getDelivery,
  updateDelivery,
  confirmDelivery,
  approveDelivery,
  getDeliveriesReadyForConfirmation,
  getAllDeliveriesForOperator
} = require('../controllers/deliveriesController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/delivery-orders/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'delivery-order-' + uniqueSuffix + '.' + file.mimetype.split('/')[1])
  }
})

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
});

// All roles that can access deliveries
router.route('/')
  .post(protect, authorize('Super Admin', 'Admin'), createDelivery)
  .get(protect, authorize('Super Admin', 'Admin', 'Operator'), getDeliveries);

router.route('/ready-for-confirmation')
  .get(protect, authorize('Operator'), getDeliveriesReadyForConfirmation);

router.route('/operator')
  .get(protect, authorize('Operator'), getAllDeliveriesForOperator);

router.route('/:id')
  .get(protect, authorize('Super Admin', 'Admin', 'Operator'), getDelivery)
  .put(protect, authorize('Super Admin', 'Admin'), updateDelivery);

// Special endpoints
router.route('/:id/confirm')
  .put(protect, authorize('Operator'), confirmDelivery);

// Special endpoint for Operator confirmation with photo upload
router.route('/:id/confirm-with-photo')
  .put(protect, authorize('Operator'), upload.single('deliveryOrderPhoto'), confirmDelivery);

// Deprecated endpoint
// router.route('/:id/approve')
//   .put(protect, authorize('Super Admin', 'Admin'), approveDelivery);

module.exports = router;