const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  authController.register
);

router.post('/signup',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty(),
  body('role').isIn(['USER', 'ADMIN', 'READ_ONLY']),
  authController.signup
);

router.post('/login',
  body('email').isEmail(),
  body('password').exists(),
  authController.login
);

router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;
