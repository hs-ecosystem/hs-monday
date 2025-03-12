const db = require('../models')
const UserSettings = db.userSettings
const { reportError } = require('../utils')

/**
 *
 * Create
 *
 */
exports.create = async (req, res) => {
  try {
    const monday_id = res.locals.monday_user_id
    if (!monday_id) {
      if (!req.body.hootsuiteUid) {
        reportError(
          'No Hootsuite UID in hootsuite/access-tokens/create',
          req.originalUrl
        )
      }
      res.status(400).send({ message: 'Monday ID cannot be empty!' })
      return
    }

    const userSettings = {
      monday_id,
      hootsuite_uid: req.body.hootsuiteUid,
      field_mappings: req.body.fieldMappings,
      num_months_to_import: req.body.numMonthsToImport,
      board_id: req.body.boardId,
      group_id: req.body.groupId,
    }

    const { data } = await UserSettings.create(userSettings)
    res.send(data)
  } catch (catchError) {
    const errorMessage = 'Could not create the UserSettings.'
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
    const { boardId } = req.body
    const monday_id = res.locals.monday_user_id
    if (!monday_id) {
      const message = `Monday ID and Board ID cannot be empty!`
      return res.status(400).send({ message })
    }

    const where = { monday_id, board_id: boardId }
    const [data] = await UserSettings.findAll({ where })

    const returnData = data?.dataValues
      ? {
          fieldMappings: data.dataValues.field_mappings,
          numMonthsToImport: data.dataValues.num_months_to_import,
          boardId: data.dataValues.board_id,
          groupId: data.dataValues.group_id,
          hasViewedWizard: data.dataValues.has_viewed_wizard,
        }
      : undefined

    res.send(returnData)
  } catch (catchError) {
    const errorMessage = 'Could not get One userSetting.'
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
  const monday_id = res.locals.monday_user_id
  try {
    const {
      hootsuiteUid,
      fieldMappings,
      numMonthsToImport,
      boardId,
      groupId,
      hasViewedWizard,
    } = req.body
    if (!monday_id || !boardId) {
      if (!hootsuiteUid) {
        const errorMessage = 'No Hootsuite UID in user-settings/update'
        console.log(errorMessage, req.originalUrl)
        reportError(errorMessage, req.originalUrl)
      }
      const message = `Monday ID or Board ID cannot be empty!`
      return res.status(400).send({ message })
    }

    const updateData = {
      ...(hootsuiteUid && { hootsuite_uid: hootsuiteUid }),
      num_months_to_import: numMonthsToImport,
      board_id: boardId,
      group_id: groupId,
      ...(fieldMappings && { field_mappings: fieldMappings }),
      ...(hasViewedWizard && { has_viewed_wizard: hasViewedWizard }),
    }

    const [userSettingsRes] = await UserSettings.update(updateData, {
      where: { monday_id, board_id: boardId },
    })

    if (userSettingsRes == 1) {
      res.send({ message: 'UserSettings was updated successfully.' })
    } else {
      console.log('Cannot update the UserSettings')
      res.send({ message: `Cannot update UserSettings` })
    }
  } catch (catchError) {
    const errorMessage = `Error updating UserSettings`
    reportError(errorMessage, catchError)
    res.status(500).send({ errorMessage })
  }
}

/**
 *
 * Update
 *
 */
exports.removeFieldMappings = async (req, res) => {
  const monday_id = res.locals.monday_user_id
  try {
    const { boardId } = req.body
    if (!monday_id || !boardId) {
      if (!monday_id || boardId) {
        const errorMessage = 'No monday_id or boardId in user-settings/update'
        console.log(errorMessage, req.originalUrl)
        reportError(errorMessage, req.originalUrl)
      }
      const message = `Monday ID or Board ID cannot be empty!`
      return res.status(400).send({ message })
    }

    const updateData = { field_mappings: null }

    const [userSettingsRes] = await UserSettings.update(updateData, {
      where: { monday_id, board_id: boardId },
    })

    if (userSettingsRes == 1) {
      console.log('updated user settins! ==== ')
      res.send({ message: 'UserSettings was updated successfully.' })
    } else {
      console.log('Cannot update the UserSettings')
      res.send({ message: `Cannot update UserSettings` })
    }
  } catch (catchError) {
    const errorMessage = `Error updating UserSettings`
    reportError(errorMessage, catchError)
    res.status(500).send({ errorMessage })
  }
}

/**
 *
 * Delete
 *
 */
exports.delete = (req, res) => {
  const monday_id = res.locals.monday_user_id
  try {
    const { data } = UserSettings.destroy({
      where: { monday_id },
    })

    if (data == 1) {
      res.send({ message: 'UserSettings was deleted successfully!' })
    } else {
      res.send({
        message: `Cannot delete UserSettings`,
      })
    }
  } catch (catchError) {
    const errorMessage = `Could not delete UserSettings`
    reportError(errorMessage, catchError)
    res.status(500).send({ errorMessage })
  }
}
