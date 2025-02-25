require('dotenv').config()
const express = require('express')
const router = express.Router()
const userSettings = require('../controllers/user_settings.controller.js')
const {
  checkSignatureMiddleware,
  addMondayIdMiddleware,
} = require('../middlewares/authentication.js')

/**
 *
 * /api/monday/user-settings
 *
 */

// Create new
router.post('/create', checkSignatureMiddleware, userSettings.create)

// Retrieve one based on mondayId
router.post('/get', checkSignatureMiddleware, userSettings.findAll)

// Retrieve one based on mondayId from webhook
router.post('/get-from-webhook', addMondayIdMiddleware, userSettings.findAll)

// Update with mondayId
router.post('/update', checkSignatureMiddleware, userSettings.update)

// Delete based on mondayId
router.post('/delete', checkSignatureMiddleware, userSettings.delete)

// Remove fieled mappings in user settings only
router.post(
  '/remove-field-mappings',
  checkSignatureMiddleware,
  userSettings.removeFieldMappings
)

module.exports = router
