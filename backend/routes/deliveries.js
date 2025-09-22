const express = require('express');
const router = express.Router();
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

// Only configure multer for local development, not for Vercel
let upload;
if (process.env.NODE_ENV !== 'production') {
  const multer = require('multer');
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/delivery-orders/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, 'delivery-order-' + uniqueSuffix + '.' + file.mimetype.split('/')[1])
    }
  })

  upload = multer({ 
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
} else {
  // For Vercel production, use memory storage or skip file upload handling
  upload = {
    single: () => (req, res, next) => next()
  };
}

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