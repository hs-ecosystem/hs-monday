const axios = require('axios')
const config = require('../config')
const { reportError } = require('../utils')
const jwt = require('jsonwebtoken')

const getFieldMappings = async ({
  req,
  shortLivedToken,
  mondayId,
  boardId,
}) => {
  try {
    const url = `${config.app.baseUrl}/api/monday/user-settings/get`
    const auth = shortLivedToken || req.headers.authorization
    const axiosHeaders = { headers: { Authorization: auth } }
    const { data } = await axios.post(url, { mondayId, boardId }, axiosHeaders)
    return data.fieldMappings
  } catch (catchError) {
    const errorMessage = `Could not get Field Mappings`
    reportError(errorMessage, catchError)
  }
}

const getFieldObject = async ({ hootsuiteField, mondayItem, fields }) => {
  try {
    if (fields && mondayItem && hootsuiteField) {
      return mondayItem?.column_values?.find(
        (c) => c.id === fields?.[`selected${hootsuiteField}Field`]?.id
      )
    } else {
      return
    }
  } catch (catchError) {
    const errorMessage = `Could not get field object`
    reportError(errorMessage, catchError)
  }
}

/**
 *
 * Only used for webhook route
 */
const getFieldMappingsFromWebhook = async ({ mondayId, boardId }) => {
  try {
    const jwtToken = jwt.sign(mondayId, process.env.MONDAY_SIGNING_SECRET)
    const axiosHeaders = { headers: { Authorization: jwtToken } }
    const url = `${config.app.baseUrl}/api/monday/user-settings/get-from-webhook`
    const { data } = await axios.post(url, { mondayId, boardId }, axiosHeaders)
    return data.fieldMappings
  } catch (catchError) {
    const errorMessage = `Could not get Field Mappings from webhook`
    reportError(errorMessage, catchError)
  }
}

/**
 *
 * Only used for webhook route
 */
const getFieldObjectFromWebhook = async ({
  hootsuiteField,
  mondayItem,
  fields,
}) => {
  try {
    if (fields && mondayItem && hootsuiteField) {
      return mondayItem?.column_values?.find(
        (c) => c.id === fields?.[`selected${hootsuiteField}Field`]?.id
      )
    } else {
      return
    }
  } catch (catchError) {
    const errorMessage = `Could not get field object from webhook`
    reportError(errorMessage, catchError)
  }
}

const getMappedFieldName = ({ columnValue, hsMessage }) => {
  try {
    const field = Object.entries(hsMessage).find(([key, value]) => {
      if (hsMessage[key].dateWithTime) {
        return value === columnValue[key].value
      } else {
        return value === columnValue.value
      }
    })

    const fieldName = field[0]
    return fieldName
  } catch (catchError) {
    const errorMessage = `Could not get Monday mapped field name.`
    reportError(errorMessage, catchError)
  }
}

const isFieldUserCanUpdate = async ({
  columnValue,
  sourceColumnId,
  mondayId,
  boardId,
  shortLivedToken,
}) => {
  try {
    const fields = await getFieldMappings({
      shortLivedToken,
      mondayId,
      boardId,
    })
    const LIST_OF_FIELDS_USER_CAN_UPDATE = [
      'selectedDateField',
      'selectedSocialPostField',
      'selectedProfileField',
      'selectedMediaField',
    ]
    const val = columnValue?.value || columnValue?.text
    console.log(`c: ${sourceColumnId} | s: ${val}`)

    const isValidField = LIST_OF_FIELDS_USER_CAN_UPDATE.some((f) => {
      return sourceColumnId === fields[f]?.id
    })

    return isValidField
  } catch (catchError) {
    const errorMessage = `Could not check if field can update.`
    reportError(errorMessage, catchError)
  }
}

module.exports = {
  getFieldMappings,
  getFieldObject,
  getFieldMappingsFromWebhook,
  getFieldObjectFromWebhook,
  isFieldUserCanUpdate,
  getMappedFieldName,
}
