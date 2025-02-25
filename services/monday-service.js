require('dotenv').config()
const Cryptr = require('cryptr')
const cryptr = new Cryptr(process.env.CRYPTR_KEY)
const initMondayClient = require('monday-sdk-js')
const {
  reportError,
  formatInTimeZone,
  equalsIgnoreOrder,
  shortenAWSMediaIds,
  getTimestamp,
} = require('../utils/index')
const {
  getFieldObject,
  getFieldMappings,
  getFieldMappingsFromWebhook,
  getFieldObjectFromWebhook,
} = require('../services/user-settings.service')
const config = require('../config')
const axios = require('axios')
const { format, parseISO, addHours } = require('date-fns')
const { MAP_OF_HOOTSUITE_FIELDS } = require('../constants/hootsuite')

const getColumnData = async (token, itemId, columnId) => {
  try {
    const mondayClient = initMondayClient()
    mondayClient.setToken(token)

    // const query = `query($itemId: [Int], $columnId: [String]) {
    //     items (ids: $itemId) {
    //       column_values(ids:$columnId) {
    //         items {
    //           value,
    //           type
    //         }
    //       }
    //     }
    //   }`
    const query = `
    query {
      items (ids: [${itemId}]) {
        column_values(ids: "${columnId}") {
          value,
          type
        }
        
      }
    }
    `
    const variables = { columnId, itemId }

    const response = await mondayClient.api(query, { variables })
    if (response?.errors) {
      const errorMessage = `Could not getColumnData`
      const error = JSON.stringify(response.errors)
      reportError(errorMessage, error)
    }

    const value = response?.data?.items?.[0]?.column_values?.[0]?.value
      ? response.data.items[0].column_values[0].value.replace(
          /^"(.+(?="$))"$/,
          '$1'
        )
      : ''
    const type = response?.data?.items?.[0]?.column_values?.[0]?.type
      ? response?.data?.items?.[0]?.column_values?.[0]?.type.replace(
          /^"(.+(?="$))"$/,
          '$1'
        )
      : ''
    return { value, type }
  } catch (catchError) {
    const errorMessage = `Could not get column data.`
    reportError(errorMessage, catchError)
  }
}

const changeStatusValue = async ({
  token,
  boardId,
  itemId,
  statusColumnId,
  statusValue,
}) => {
  try {
    const mondayClient = initMondayClient({ token })

    const columnValues = JSON.stringify(
      `{ "${statusColumnId}": "${statusValue}"}`
    )
    if (!statusColumnId || !statusValue) {
      const errorMessage = `Could not change status value.`
      const error = { statusColumnId, statusValue }
      reportError(errorMessage, error)
    }
    const mutationQuery = `mutation { change_multiple_column_values (board_id: ${boardId}, item_id: ${itemId}, column_values: ${columnValues}, create_labels_if_missing: true) { id } }`

    const response = await mondayClient.api(mutationQuery)
    return response
  } catch (catchError) {
    const errorMessage = `Could not change Status Column value.`
    reportError(errorMessage, catchError)
  }
}

const changeColumnValue = async ({
  token,
  boardId,
  itemId,
  columnId,
  value,
}) => {
  try {
    const mondayClient = initMondayClient({ token })

    // const mutationQuery = `mutation change_column_value($boardId: Int!, $itemId: Int!, $columnId: String!, $value: JSON!) {
    //     change_column_value(board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) {
    //       id,
    //     }
    //   }
    //   `

    const mutationQuery = `
    mutation {
      change_simple_column_value (item_id: ${itemId}, board_id: ${boardId}, column_id: "${columnId}", value: "${value}") {
        id
      }
    }
    `

    const variables = {
      boardId: parseInt(boardId),
      columnId,
      itemId: parseInt(itemId),
      value: columnId === 'status' ? value : JSON.stringify(value),
    }
    const response = await mondayClient.api(mutationQuery, { variables })
    return response
  } catch (catchError) {
    const errorMessage = `Could not change monday column value`
    reportError(errorMessage, catchError)
  }
}

const changeColumnWithLastUpdatedValue = async ({
  token,
  boardId,
  itemId,
  targetColumnId,
  targetValue,
  lastUpdatedColumnId,
  lastUpdatedValue,
}) => {
  try {
    const mondayClient = initMondayClient({ token })

    if (!targetColumnId || !lastUpdatedColumnId || !lastUpdatedValue) {
      const errorMessage = `Could not change column with last updated value.`
      const error = {
        targetColumnId,
        targetValue,
        lastUpdatedColumnId,
        lastUpdatedValue,
      }
      reportError(errorMessage, error)
    }
    // console.log(
    //   'Might be that no empty values are allowed on column text update.'
    // )
    const columnValues = JSON.stringify(
      `{ "${targetColumnId}": "${targetValue}", "${lastUpdatedColumnId}": "${lastUpdatedValue}" }`
    )

    const mutationQuery = `mutation { change_multiple_column_values (board_id: ${boardId}, item_id: ${itemId}, column_values: ${columnValues}, create_labels_if_missing: true) { id } }`

    const response = await mondayClient.api(mutationQuery)
    return response
  } catch (catchError) {
    const errorMessage = `Could not change monday column value`
    reportError(errorMessage, catchError)
  }
}

const getMondayUserId = async (token) => {
  try {
    const mondayClient = initMondayClient()
    mondayClient.setToken(token)

    const query = `query { me { id } }`
    const response = await mondayClient.api(query)

    return response.data.me.id
  } catch (err) {
    console.error('CATCH getMessageFieldName', err)
  }
}

const getMondayToken = async ({ shortLivedToken, hootsuiteUid, mondayId }) => {
  try {
    const url = `${config.app.baseUrl}/api/monday/access-token/get`
    const axiosHeaders = { headers: { Authorization: shortLivedToken } }
    const { data } = await axios.post(
      url,
      { hootsuiteUid, mondayId },
      axiosHeaders
    )
    return data.at
  } catch (catchError) {
    const errorMessage = `Could not get Monday Token`
    reportError(errorMessage, catchError)
  }
}

const getExistingMondayItem = async ({ boardId, itemId, token }) => {
  try {
    const mondayClient = initMondayClient()
    mondayClient.setToken(token)
    const query = `query { items (ids: [${itemId}]) { id, column_values { id, type, text, value } } }`
    const variables = { boardId }
    const response = await mondayClient.api(query, { variables })
    return response.data.items[0]
  } catch (err) {
    console.error(err)
  }
}

/**
 * ONLY USED FOR MessageId not other monday fields.
 */
const updateMondayItem = async ({
  mondayId,
  hootsuiteUid,
  boardId,
  itemId,
  hootsuiteField,
  value,
  shortLivedToken,
}) => {
  try {
    const encryptedToken = await getMondayToken({
      shortLivedToken,
      hootsuiteUid,
      mondayId,
    })
    const token = cryptr.decrypt(encryptedToken)
    const mondayItem = await getExistingMondayItem({
      token,
      boardId,
      itemId,
    })
    const fields = await getFieldMappings({
      shortLivedToken,
      mondayId,
      boardId,
    })

    const fieldObject = await getFieldObject({
      hootsuiteField,
      mondayItem,
      fields,
    })

    await changeColumnValue({
      token,
      boardId: parseInt(boardId),
      itemId: parseInt(itemId),
      columnId: fieldObject.id,
      value,
    })

    const newFieldObject = await getFieldObject({
      hootsuiteField,
      mondayItem,
      fields,
    })

    return newFieldObject
  } catch (catchError) {
    const errorMessage = `Could not update Monday item`
    reportError(errorMessage, catchError)
  }
}

/**
 * ONLY USED FOR Status field not other monday fields.
 */
const updateStatusField = async ({
  mondayId,
  boardId,
  itemId,
  hootsuiteField,
  value,
  token,
  timezone,
}) => {
  try {
    const mondayItem = await getExistingMondayItem({
      token,
      boardId,
      itemId,
    })
    const fields = await getFieldMappingsFromWebhook({
      token,
      mondayId,
      boardId,
    })

    const fieldObject = await getFieldObjectFromWebhook({
      hootsuiteField,
      mondayItem,
      fields,
    })

    // Update Status
    await changeStatusValue({
      token,
      boardId: parseInt(boardId),
      itemId: parseInt(itemId),
      statusColumnId: fieldObject.id,
      statusValue: value,
    })

    // Update Message ID and Last Updated
    const lastUpdatedColumnObject = await getFieldObject({
      hootsuiteField: 'LastUpdated',
      mondayItem,
      fields,
    })

    const lastUpdatedValue = timezone
      ? getTimestamp({ tz: timezone })
      : undefined

    const messageIdObject = await getFieldObject({
      hootsuiteField: 'MessageId',
      mondayItem,
      fields,
    })

    if (lastUpdatedValue) {
      // May not include timezone, as SENT status does not include any timezone. So do not try to change the last updated.
      await changeColumnWithLastUpdatedValue({
        token,
        boardId,
        itemId,
        targetColumnId: messageIdObject.id,
        targetValue: '',
        lastUpdatedColumnId: lastUpdatedColumnObject.id,
        lastUpdatedValue,
      })
    }

    return
  } catch (catchError) {
    const errorMessage = `Could not update Monday item`
    reportError(errorMessage, catchError)
  }
}

/**
 * ONLY WORKS FOR TEXT FIELD, NEED TO USE DATE FIELD TOO
 */
const hasMondayFieldUpdated = async ({ value, previousColumnValue }) => {
  try {
    // const fields = MAP_OF_HOOTSUITE_FIELDS
    // const hootsuiteField =
    // const fieldObject = await getFieldObject({mondayId, hootsuiteField , mondayItem, boardId})
    // const hsField = fields[`selected${sourceColumnId}Field`].id
    return value !== previousColumnValue?.value
  } catch (catchError) {
    const errorMessage = `Could not verify if Monday field has updated.`
    reportError(errorMessage, catchError)
  }
}

const compareDates = ({ hootsuiteDate, mondayDate }) => {
  try {
    if (mondayDate && hootsuiteDate) {
      const offset = format(parseISO(hootsuiteDate), 'x')
      const mondayIsoDate = `${mondayDate.date}T${mondayDate.time}Z`
      const adjustedMondayDate = addHours(parseISO(mondayIsoDate), -offset)
      const formattedMondayDate = format(
        adjustedMondayDate,
        `yyyy-MM-dd'T'HH:mm:ss.'000Z'`
      )

      const zhootsuiteDate = formatInTimeZone(
        parseISO(hootsuiteDate),
        `yyyy-MM-dd'T'HH:mm:ss.'000Z'`,
        'UTC'
      )

      const areDatesMatching = formattedMondayDate === zhootsuiteDate

      return areDatesMatching
    } else {
      return false
    }
  } catch (catchError) {
    const errorMessage = `Could not compare Hootsuite Message and Monday dates.`
    reportError(errorMessage, catchError)
  }
}

const getChangedFields = async ({
  mondayId,
  hootsuiteMessage,
  mondayItem,
  boardId,
  shortLivedToken,
}) => {
  try {
    const arrayOfSocialFields = Object.entries(MAP_OF_HOOTSUITE_FIELDS)

    const fields = await getFieldMappings({
      shortLivedToken,
      mondayId,
      boardId,
    })
    const fieldPromises = arrayOfSocialFields.map(async ([fKey, fValue]) => {
      const fieldObject = await getFieldObject({
        mondayId,
        hootsuiteField: fKey,
        mondayItem,
        fields,
      })

      if (fKey === 'Date') {
        const areDatesMatching = compareDates({
          hootsuiteDate: hootsuiteMessage.scheduledSendTime,
          mondayDate: JSON.parse(fieldObject.value),
        })

        if (!areDatesMatching) {
          return { key: fKey, value: fValue }
        }
      } else if (fKey === 'Media') {
        // Compare mediaIds instead of media
        const selectedMediaIds = await getFieldObject({
          hootsuiteField: 'MediaIds',
          mondayItem,
          fields,
        })

        const hsMediaIds = hootsuiteMessage?.media
          ? hootsuiteMessage.media.map((m) => m.id)
          : ['']
        const mnMediaIds = selectedMediaIds.text.split(',')

        if (
          !equalsIgnoreOrder(
            shortenAWSMediaIds({ idArray: hsMediaIds }),
            shortenAWSMediaIds({ idArray: mnMediaIds })
          )
        ) {
          return { key: 'Media', value: 'mediaUrls' }
        }
        return
      } else {
        if (fieldObject.text !== hootsuiteMessage[fValue]) {
          return { key: fKey, value: fValue }
        }
      }
    })

    const changedFields = await Promise.all(fieldPromises)
    const cleanedChangedFields = changedFields.filter((c) => c)

    return cleanedChangedFields
  } catch (catchError) {
    const errorMessage = `Could not determine what fields have changed.`
    reportError(errorMessage, catchError)
  }
}

// const getHootsuiteSocialProfiles = async ({ mondayId }) => {
//   try {
//     const url = `${config.app.baseUrl}/api/hootsuite/social-profiles/get-all`
//     const axiosHeaders = { headers: { Cookie: `monday_user_id=${mondayId}` } }
//     const { data } = await axios.post(url, { mondayId }, axiosHeaders)

//     const hydratePromises = await data.profiles.map(async (p) => {
//       if (p.type === 'TWITTER') {
//         const hydrateUrl = `${config.app.baseUrl}/api/hootsuite/twitter/profile-hydrate`
//         const axiosBody = { mondayId, socialNetworkId: p.socialNetworkId }
//         const axiosHeaders = {
//           headers: { Cookie: `monday_user_id=${mondayId}` },
//         }
//         const hydratedProfile = await axios.post(
//           hydrateUrl,
//           axiosBody,
//           axiosHeaders
//         )

//         return {
//           ...p,
//           ...hydratedProfile.data,
//           id: p.id,
//         }
//       } else {
//         return p
//       }
//     })
//     const items = await Promise.all(hydratePromises)
//     return items
//   } catch (catchError) {
//     const errorMessage = `Could not get all Hootsuite Social Profiles.`
//     reportError(errorMessage, catchError)
//   }
// }

const getHootsuiteSocialProfile = ({ profiles, profileName }) => {
  try {
    return profiles.find((p) => p.socialNetworkUsername === profileName)
  } catch (catchError) {
    const errorMessage = `Could not get one Hootsuite social profile.`
    reportError(errorMessage, catchError)
  }
}

const getFileAssets = async ({ token, value }) => {
  try {
    const mondayClient = initMondayClient()
    mondayClient.setToken(token)

    const idsArray = value.files.map((f) => f.assetId)
    const query = `query { assets (ids: [${idsArray.toString()}]) { id, name, public_url } }`

    const response = await mondayClient.api(query)
    return response?.data?.assets
  } catch (catchError) {
    const errorMessage = `Could not get Monday file asset.`
    reportError(errorMessage, catchError)
  }
}

const clearMondayColumnValue = async ({
  hootsuiteUid,
  mondayId,
  boardId,
  itemId,
  columnId,
  isFileColumn,
  shortLivedToken,
}) => {
  try {
    const encryptedToken = await getMondayToken({
      shortLivedToken,
      hootsuiteUid,
      mondayId,
    })
    const token = cryptr.decrypt(encryptedToken)
    const value = isFileColumn ? { clear_all: true } : ''
    const clearRes = await changeColumnValue({
      token,
      boardId: parseInt(boardId),
      itemId: parseInt(itemId),
      columnId,
      value,
    })
    return clearRes
  } catch (catchError) {
    const errorMessage = `Could not clear Monday column value`
    reportError(errorMessage, catchError)
  }
}

const addUpdateToItem = async ({ token, itemId, updateMessage }) => {
  try {
    const mondayClient = initMondayClient()
    mondayClient.setToken(token)

    const query = `mutation {create_update (item_id: ${itemId}, body: "${updateMessage}") { id } }`

    const response = await mondayClient.api(query)
    return response?.data
  } catch (catchError) {
    const errorMessage = `Could not remove file from monday`
    reportError(errorMessage, catchError)
  }
}

module.exports = {
  getColumnData,
  changeColumnValue,
  changeStatusValue,
  changeColumnWithLastUpdatedValue,
  getMondayUserId,
  getMondayToken,
  getExistingMondayItem,
  updateMondayItem,
  hasMondayFieldUpdated,
  getChangedFields,
  getHootsuiteSocialProfile,
  getFileAssets,
  clearMondayColumnValue,
  addUpdateToItem,
  updateStatusField,
}
