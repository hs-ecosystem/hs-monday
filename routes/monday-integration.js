const router = require('express').Router()
const { authenticationMiddleware } = require('../middlewares/authentication')
const mondayController = require('../controllers/monday-controller')

/**
 * /api/monday
 */
router.post('/', (req, res) => {
  res.send({ ok: true })
})

router.post(
  '/execute_action',
  authenticationMiddleware,
  mondayController.executeAction
)

router.post(
  '/create_action',
  authenticationMiddleware,
  mondayController.createAction
)

router.post(
  '/delete_action',
  authenticationMiddleware,
  mondayController.deleteAction
)

router.post(
  '/get-field-defs',
  authenticationMiddleware,
  mondayController.getFieldDefs
)

module.exports = router
