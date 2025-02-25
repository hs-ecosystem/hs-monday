const db = require('../models')
const MondayAccessTokens = db.mondayAccessTokens
const { reportError } = require('../utils')

/**
 *
 * Create
 *
 */
exports.create = async (req, res) => {
  try {
    const { hootsuiteUid, mondayId, accessToken } = req.body
    if (!hootsuiteUid || !mondayId) {
      const message = `Hootsuite UID or Monday ID cannot be empty!`
      return res.status(400).send({ message })
    }

    const mondayAccessToken = {
      monday_id: mondayId,
      hootsuite_uid: hootsuiteUid,
      access_token: accessToken,
    }

    const { data } = await MondayAccessTokens.create(mondayAccessToken)

    res.send(data)
  } catch (catchError) {
    const errorMessage =
      'Some error occurred while creating the MondayAccessTokens.'
    reportError(errorMessage, catchError)
    res.status(500).send({ errorMessage })
  }
}

/**
 *
 * Get One
 *
 */
exports.findAll = async (req, res) => {
  try {
    const monday_id = res?.locals?.monday_user_id
    if (!monday_id) {
      const message = 'Monday ID cannot be empty!'
      return res.status(400).send({ message })
    }

    const where = { monday_id }

    const [data] = await MondayAccessTokens.findAll({ where })
    const returnData = data?.dataValues
      ? { at: data.dataValues.access_token }
      : {}

    res.send(returnData)
  } catch (catchError) {
    const errorMessage =
      'Some error occurred while retrieving mondayAccessToken.'
    reportError(errorMessage, catchError)
    res.status(500).send({ errorMessage })
  }
}

/**
 *
 * Update
 *
 */
exports.update = async (req, res) => {
  console.log('req, res', req, res)
  // try {
  //   if (!req.body.hootsuiteUid) {
  //     res.status(400).send({ message: 'Monday ID cannot be empty!' })
  //     return
  //   }

  //   const data = { access_token: req.body.accessToken }

  //   const where = { hootsuite_uid: req.body.hootsuiteUid }
  //   const [updateRes] = await MondayAccessTokens.update(data, { where })

  //   if (updateRes == 1) {
  //     res.send({ message: 'MondayAccessToken was updated successfully.' })
  //   } else {
  //     res.send({
  //       message: `Cannot update MondayAccessTokens with hootsuiteUid=${req.body.hootsuiteUid}. Maybe MondayAccessTokens was not found or req.body is empty!`,
  //     })
  //   }
  // } catch (catchError) {
  //   const errorMessage = `Error updating MondayAccessTokens with hootsuiteUid=${req.body.hootsuiteUid}`
  //   reportError(errorMessage, catchError)
  //   res.status(500).send({ errorMessage })
  // }
}

/**
 *
 * Delete
 *
 */
exports.delete = async (req, res) => {
  try {
    const monday_id = res.locals.monday_user_id
    if (!monday_id) {
      res.status(400).send({ message: 'Monday ID cannot be empty!' })
      return
    }

    const where = { monday_id }
    const deleteRes = await MondayAccessTokens.destroy({ where })

    if (deleteRes == 1) {
      res.send({ message: 'MondayAccessTokens was deleted successfully!' })
    } else {
      res.send({
        message: `Cannot delete MondayAccessTokens.`,
      })
    }
  } catch (catchError) {
    const errorMessage = `Could not delete MondayAccessTokens.`
    reportError(errorMessage, catchError)
    res.status(500).send({ errorMessage })
  }
}
