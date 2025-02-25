const {
  getColumnData,
  changeColumnWithLastUpdatedValue,
  getExistingMondayItem,
  changeColumnValue,
  changeStatusValue,
  addUpdateToItem,
} = require('../services/monday-service')
const {
  updateSocialField,
  createHootsuiteMessage,
  getHootsuiteFieldDefs,
  getHootsuiteItem,
  getHootsuiteAccessTokenfromDb,
  handleFileChange,
  getHootsuiteMessage,
  deleteHootsuiteMessage,
} = require('../services/hootsuite-service')
const {
  isFieldUserCanUpdate,
  getFieldObject,
  getFieldMappings,
} = require('../services/user-settings.service')
const {
  reportError,
  getTimestamp,
  isValidJSON,
  debugMode,
} = require('../utils')
const { default: axios } = require('axios')
const config = require('../config')
const { FIELD_MAPPINGS_NOT_SETUP } = require('../constants/monday')

async function executeAction(req, res) {
  try {
    console.log('~~ executeAction ~~')
    const { shortLivedToken, userId } = req.session
    const { payload } = req.body
    const { inputFields } = payload
    const { boardId, itemId, sourceColumnId, columnValue } = inputFields

    const mondayId = userId
    const mondayItem = await getExistingMondayItem({
      token: shortLivedToken,
      boardId,
      itemId,
    })

    if (!mondayItem) {
      const errorMessage = `No monday item.`
      const error = {
        shortLivedToken,
        boardId,
        itemId,
      }
      //
      // Actively turning off error reporting.
      //
      // reportError(errorMessage, error)
      console.log(errorMessage, error)
      return res.status(200).send({ message: errorMessage })
    }

    const fields = await getFieldMappings({
      shortLivedToken,
      mondayId,
      boardId,
    })
    // Fields not mapped
    if (!fields) {
      const errorMessage = FIELD_MAPPINGS_NOT_SETUP
      // Not reporting but still showing in the console and a monday.com item's update.
      console.log(errorMessage)
      // reportError(errorMessage, { source: 'execute_action', fields, mondayId })
      addUpdateToItem({
        token: shortLivedToken,
        itemId,
        updateMessage: errorMessage,
      })
      return res.status(200).send({ message: errorMessage })
    }

    const messageIdObject = await getFieldObject({
      hootsuiteField: 'MessageId',
      mondayItem,
      fields,
    })
    const messageId = messageIdObject?.text

    const { value, type } = await getColumnData(
      shortLivedToken,
      itemId,
      sourceColumnId
    )

    // Does the HS message exist already
    if (messageId) {
      const isValidField = await isFieldUserCanUpdate({
        shortLivedToken,
        columnValue,
        mondayId,
        sourceColumnId,
        boardId,
      })

      if (isValidField) {
        const hootsuiteMessage = await getHootsuiteMessage({
          shortLivedToken,
          mondayId,
          messageId,
        })
        // Not draft and media has changed from HS
        const selectedMediaField = await getFieldObject({
          hootsuiteField: 'Media',
          mondayItem,
          fields,
        })

        if (
          sourceColumnId === selectedMediaField?.id &&
          value &&
          isValidJSON(value) &&
          JSON.parse(value).files
        ) {
          await handleFileChange({
            mondayId,
            boardId,
            itemId,
            token: shortLivedToken,
            columnValue: JSON.parse(value),
            mondayItem,
            messageId,
            shortLivedToken,
          })
        }

        const messageIdColumnId = messageIdObject.id
        const { timezone } = await getHootsuiteAccessTokenfromDb({
          shortLivedToken,
          mondayId,
        })
        const lastUpdatedValue = getTimestamp({ tz: timezone })

        // Update Hootsuite message
        const f = {
          mondayId,
          messageId,
          value,
          type,
          boardId,
          itemId,
          hootsuiteMessage,
          shortLivedToken,
        }
        const updatedHootsuiteMessage = await updateSocialField(f)

        if (updatedHootsuiteMessage?.updatedMessageId) {
          const lastUpdatedColumnObject = await getFieldObject({
            hootsuiteField: 'LastUpdated',
            mondayItem,
            fields,
          })
          const mondayColUpdate = await changeColumnWithLastUpdatedValue({
            token: shortLivedToken,
            boardId,
            itemId,
            targetColumnId: messageIdColumnId,
            targetValue: updatedHootsuiteMessage.updatedMessageId,
            lastUpdatedColumnId: lastUpdatedColumnObject.id,
            lastUpdatedValue,
          })

          // Just checking for success after updating column.  Value not specific
          if (mondayColUpdate.account_id) {
            await deleteHootsuiteMessage({
              hootsuiteMessage,
              shortLivedToken,
              mondayId,
              messageId,
            })
          }
          return res.status(200).send({ updated: true })
        }
        return res.status(200).send({ noUpdate: true })
      } else {
        return res.status(200).send({ noUpdate: true })
      }
    } else {
      // HS Message doesn't exist but file uploaded in monday draft
      const selectedMediaField = await getFieldObject({
        hootsuiteField: 'Media',
        mondayItem,
        fields,
      })

      if (
        sourceColumnId === selectedMediaField?.id &&
        value &&
        isValidJSON(value) &&
        JSON.parse(value).files
      ) {
        await handleFileChange({
          mondayId,
          boardId,
          itemId,
          token: shortLivedToken,
          columnValue: JSON.parse(value),
          shortLivedToken,
          mondayItem,
        })
      }
      return res.status(200).send({ noUpdate: true })
    }
  } catch (err) {
    console.error(err)
    return res.status(200).send({ message: 'Unknown error' })
  }
}

const resolveSendTime = (maybeSendTime) => {
  try {
    if (maybeSendTime) {
      const FIVE_MINS = 5 * 60 * 1000
      const mondayTimeInUnix = new Date(maybeSendTime).getTime()
      const nowTime = new Date().getTime()
      if (mondayTimeInUnix - nowTime < FIVE_MINS) {
        return undefined
      } else {
        return maybeSendTime
      }
    } else {
      return undefined
    }
  } catch (catchError) {
    const errorMessage = `Could not resolve send time`
    reportError(errorMessage, catchError)
  }
}

async function createAction(req, res) {
  try {
    const { shortLivedToken, userId } = req.session
    const { payload } = req.body
    const { inputFields } = payload
    const { boardId, itemId } = inputFields

    const mondayId = userId
    const mondayItem = await getExistingMondayItem({
      token: shortLivedToken,
      boardId,
      itemId,
    })

    if (!mondayItem) {
      const errorMessage = `No monday item`
      const error = {
        shortLivedToken,
        boardId,
        itemId,
      }
      //
      // Actively turning off error reporting.
      //
      // reportError(errorMessage, error)
      console.log(errorMessage, error)
      return res.status(200).send({ message: errorMessage })
    }

    const fields = await getFieldMappings({
      shortLivedToken,
      mondayId,
      boardId,
    })

    // Fields not mapped
    if (!fields) {
      const errorMessage = FIELD_MAPPINGS_NOT_SETUP
      reportError(errorMessage, { source: 'create_action', fields, mondayId })
      addUpdateToItem({
        token: shortLivedToken,
        itemId,
        updateMessage: errorMessage,
      })
      return res.status(200).send({ message: errorMessage })
    }

    const lastUpdatedColumn = await getFieldObject({
      hootsuiteField: 'LastUpdated',
      mondayItem,
      fields,
    })

    const { timezone, hootsuiteUid } = await getHootsuiteAccessTokenfromDb({
      shortLivedToken,
      mondayId,
    })

    const messageIdColumn = await getFieldObject({
      hootsuiteField: 'MessageId',
      mondayItem,
      fields,
    })

    const hootsuiteItem = await getHootsuiteItem({
      shortLivedToken,
      mondayId,
      mondayItem,
      boardId,
    })

    if (hootsuiteItem) {
      const lastUpdatedValue = getTimestamp({ tz: timezone })

      const scheduledSendTime = resolveSendTime(
        hootsuiteItem?.scheduledSendTime
      )

      const f = {
        mondayId,
        hootsuiteUid,
        hootsuiteItem,
        scheduledSendTime,
        boardId,
        itemId,
        shortLivedToken,
      }
      const newHootsuiteMessage = await createHootsuiteMessage(f)
      const m = { newHootsuiteMessage }
      debugMode({ hootsuiteUid, m })
      if (!newHootsuiteMessage?.ok) {
        const error =
          newHootsuiteMessage?.errorMessage?.[0]?.message || newHootsuiteMessage
        const errorMessage = `Could not create Hootsuite message`
        reportError(errorMessage, error)
        return res.status(200).send({ error, errorMessage })
      }

      const statusColumn = await getFieldObject({
        hootsuiteField: 'Status',
        mondayItem,
        fields,
      })

      const statusValue = scheduledSendTime ? 'SCHEDULED' : 'SENT'
      await changeStatusValue({
        token: shortLivedToken,
        boardId,
        itemId,
        statusColumnId: statusColumn.id,
        statusValue,
      })

      const targetValue = hootsuiteItem.scheduledSendTime
        ? newHootsuiteMessage.message[0].id
        : ''
      await changeColumnWithLastUpdatedValue({
        token: shortLivedToken,
        boardId,
        itemId,
        targetColumnId: messageIdColumn.id,
        targetValue,
        lastUpdatedColumnId: lastUpdatedColumn.id,
        lastUpdatedValue,
      })

      return res.status(200).send({ noCreate: true })
    } else {
      const errorMessage = `No hootsuite item`
      const error = {
        shortLivedToken,
        mondayId,
        mondayItem,
        boardId,
      }
      //
      // Actively turning off error reporting.
      //
      // reportError(errorMessage, error)
      console.log(errorMessage, error)
      return res.status(200).send({ message: errorMessage })
    }
  } catch (catchError) {
    const errorMessage = `Could not create action.`
    reportError(errorMessage, catchError)
    return res.status(200).send({ message: errorMessage })
  }
}

async function deleteAction(req, res) {
  try {
    const { shortLivedToken, userId } = req.session
    const { payload } = req.body
    const boardId = payload.inputFields.boardId
    const itemId = payload.inputFields.itemId

    const mondayId = userId
    const token = shortLivedToken

    const mondayItem = await getExistingMondayItem({
      token: shortLivedToken,
      boardId,
      itemId,
    })

    const fields = await getFieldMappings({
      shortLivedToken,
      mondayId,
      boardId,
    })

    // Fields not mapped
    if (!fields) {
      const errorMessage = FIELD_MAPPINGS_NOT_SETUP
      reportError(errorMessage, {
        source: 'delete_action',
        fields,
        mondayId,
      })
      addUpdateToItem({
        token: shortLivedToken,
        itemId,
        updateMessage: errorMessage,
      })
      return res.status(200).send({ message: errorMessage })
    }

    const messageIdColumn = await getFieldObject({
      hootsuiteField: 'MessageId',
      mondayItem,
      fields,
    })

    if (messageIdColumn?.text) {
      const lastUpdatedColumn = await getFieldObject({
        hootsuiteField: 'LastUpdated',
        mondayItem,
        fields,
      })

      const statusColumn = await getFieldObject({
        hootsuiteField: 'Status',
        mondayItem,
        fields,
      })

      const { timezone } = await getHootsuiteAccessTokenfromDb({
        shortLivedToken,
        mondayId,
      })
      const lastUpdatedValue = getTimestamp({ tz: timezone })

      const axiosHeaders = { headers: { Authorization: shortLivedToken } }
      const deleteMessageRes = await axios.post(
        `${config.app.baseUrl}/api/hootsuite/messages/delete`,
        { mondayId, messageId: messageIdColumn.text },
        axiosHeaders
      )

      if (deleteMessageRes.data.ok) {
        await changeColumnValue({
          token,
          boardId,
          itemId,
          columnId: messageIdColumn.id,
          value: '',
        })

        await changeColumnWithLastUpdatedValue({
          token,
          boardId,
          itemId,
          targetColumnId: statusColumn.id,
          targetValue: 'DELETED',
          lastUpdatedColumnId: lastUpdatedColumn.id,
          lastUpdatedValue,
        })
        return res.send({})
      }
      return res.send({ noDelete: true })
    } else {
      const errorMessage = `Could not delete Hootsuite Message`
      //
      // Actively turning off error reporting.
      //
      // reportError(errorMessage)
      console.log(errorMessage, messageIdColumn)
      res.status(200).send({ errorMessage })
    }
  } catch (catchError) {
    const errorMessage = `Could not delete from Monday button click.`
    reportError(errorMessage, catchError)
    res.status(200).send({ errorMessage })
  }
}

async function getFieldDefs(req, res) {
  try {
    const fieldDefs = getHootsuiteFieldDefs()
    return res.status(200).send(fieldDefs)
  } catch (err) {
    console.error(err)
    return res.status(500).send({ message: 'internal server error.' })
  }
}

module.exports = {
  executeAction,
  createAction,
  deleteAction,
  getFieldDefs,
}
