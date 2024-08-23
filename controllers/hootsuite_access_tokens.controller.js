const db = require('../models')
const { reportError } = require('../utils')
const HootsuiteAccessTokens = db.hootsuiteAccessTokens

/**
 *
 * Create
 *
 */
exports.create = async (req, res) => {
  try {
    const { hootsuiteUid, mondayId } = req.body
    if (!mondayId || !hootsuiteUid) {
      const message = `Monday ID or Hootsuite UID cannot be empty!`
      reportError(message, JSON.stringify(req.body))
      return res.status(400).send({ message })
    }

    const hootsuiteAccessToken = {
      monday_id: mondayId,
      hootsuite_uid: hootsuiteUid,
      access_token: req.body.accessToken,
      refresh_token: req.body.refreshToken,
      timezone: req.body.timezone,
    }

    const { data } = await HootsuiteAccessTokens.create(hootsuiteAccessToken)
    res.send(data)
  } catch (catchError) {
    const errorMessage =
      'Some error occurred while creating the HootsuiteAccessTokens.'
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
    const monday_id = res.locals.monday_user_id
    if (!monday_id) {
      res.status(400).send({ message: 'Monday ID cannot be empty.' })
      return
    }

    const where = { monday_id }
    const [data] = await HootsuiteAccessTokens.findAll({ where })
    const returnData = data?.dataValues
      ? {
          at: data.dataValues.access_token,
          rt: data.dataValues.refresh_token,
          hootsuiteUid: data.dataValues.hootsuite_uid,
          mondayId: data.dataValues.monday_id,
          timezone: data.dataValues.timezone,
        }
      : {}

    res.send(returnData)
  } catch (catchError) {
    const errorMessage =
      'Some error occurred while retrieving hootsuiteAccessToken.'
    reportError(errorMessage, catchError)
    res.status(500).send({ errorMessage })
  }
}

/**
 *
 * Check if Hootsuite UID exists.  Cannot be called from front end without req, res.
 *
 */
exports.checkIfHsIdExists = async ({ hootsuiteUid }) => {
  try {
    const where = { hootsuite_uid: hootsuiteUid }
    const [data] = await HootsuiteAccessTokens.findAll({ where })
    return data?.dataValues ? true : false
  } catch (catchError) {
    const errorMessage = 'Some error occurred while checking if hs uid exists.'
    reportError(errorMessage, catchError)
    return errorMessage
  }
}

/**
 *
 * Update
 *
 */
exports.update = async (req, res) => {
  try {
    const monday_id = res.locals.monday_user_id
    if (!monday_id) {
      if (!req.body.hootsuiteUid) {
        reportError(
          'No Hootsuite UID in hootsuite/access-tokens/update',
          req.originalUrl
        )
      }
      const message = 'Monday ID cannot be empty!'
      reportError(message, JSON.stringify(req.body))
      res.status(400).send({ message })
      return
    }

    const data = {
      access_token: req.body.accessToken,
      refresh_token: req.body.refreshToken,
      timezone: req.body.timezone,
    }

    const where = { monday_id }
    const [updateRes] = await HootsuiteAccessTokens.update(data, {
      where,
    })

    if (updateRes == 1) {
      res.send({
        message: 'HootsuiteAccessTokens was updated successfully.',
        ok: true,
      })
    } else {
      res.send({
        message: `Cannot update HootsuiteAccessTokens.`,
      })
    }
  } catch (catchError) {
    const errorMessage = `Error updating HootsuiteAccessTokens`
    reportError(errorMessage, catchError)
    res.status(500).send({ errorMessage })
  }
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
    const deleteRes = await HootsuiteAccessTokens.destroy({ where })

    if (deleteRes == 1) {
      res.send({ message: 'HootsuiteAccessTokens was deleted successfully!' })
    } else {
      res.send({
        message: `Cannot delete HootsuiteAccessTokens.`,
      })
    }
  } catch (catchError) {
    const errorMessage = `Could not delete HootsuiteAccessTokens.`
    reportError(errorMessage, catchError)
    res.status(500).send({ errorMessage })
  }
}
