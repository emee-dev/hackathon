const router = require('express').Router();

const {
  is_required,
  idempotentMiddleware,
  verifyPaymentReference,
  isAdmin,
} = require('../middleware/middleware');

const {
  registerController,
  loginController,
  refreshTokenController,
  productUploadController,
  archiveDownloadController,
  paginatedProductListController,
} = require('../controllers/controller');

// register a new entity
router.post('/register', registerController);

// issue a secure httponly cookie in a jwt only access token
router.post('/login', loginController);

// issue a refresh token here require access token and login info to issue a refresh token
router.post('/refresh', refreshTokenController);

// allow only admin to upload only zip files
router.post('/products/upload', is_required, productUploadController);

// download archive file
router.get(
  '/products/:id/download',
  idempotentMiddleware,
  verifyPaymentReference,
  archiveDownloadController,
);

// list all uploaded files available for download
router.get('/products/list', paginatedProductListController);

// TODO endpoint to validate source code license key domain info

module.exports = router;
