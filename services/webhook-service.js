const { default: axios } = require('axios')
// const { parseISO } = require('date-fns')
const config = require('../config')
const {
  reportError,
  // getTimestamp,
  // formatInTimeZone,
  // equalsIgnoreOrder,
  // shortenAWSMediaIds,
} = require('../utils')
// const { getHootsuiteAccessTokenfromDb } = require('../services/util-service')
const {
  getExistingMondayItem,
  // getChangedFields,
  // getMondayToken,
  // changeColumnValue,
  // changeColumnWithLastUpdatedValue,
  // clearMondayColumnValue,
  updateStatusField,
} = require('./monday-service')
// const { getFieldObject, getFieldMappings } = require('./user-settings.service')
const Cryptr = require('cryptr')
const cryptr = new Cryptr(process.env.CRYPTR_KEY)
const jwt = require('jsonwebtoken')

// const formatHootsuiteDateToMondayObject = ({ hootsuiteMessage }) => {
//   try {
//     const hsDate = formatInTimeZone(
//       parseISO(hootsuiteMessage.scheduledSendTime),
//       `yyyy-MM-dd`,
//       'Etc/UTC'
//     )
//     const hsTime = formatInTimeZone(
//       parseISO(hootsuiteMessage.scheduledSendTime),
//       `H:mm:ss`,
//       'Etc/UTC'
//     )
//     return JSON.stringify({ date: hsDate, time: hsTime })
//   } catch (catchError) {
//     const errorMessage = `Could not format Hootsuite Date to Monday Object.`
//     reportError(errorMessage, catchError)
//   }
// }

// const updateMondayColumnValues = async ({
//   mondayId,
//   hootsuiteUid,
//   hootsuiteMessage,
//   mondayItem,
//   boardId,
//   shortLivedToken,
// }) => {
//   try {
//     const changedFields = await getChangedFields({
//       shortLivedToken,
//       mondayId,
//       hootsuiteMessage,
//       mondayItem,
//       boardId,
//     })

//     if (changedFields && changedFields.length) {
//       const fields = await getFieldMappings({
//         shortLivedToken,
//         mondayId,
//         boardId,
//       })
//       const updateFieldsPromises = changedFields.map(async (f) => {
//         const fieldObject = await getFieldObject({
//           hootsuiteField: f.key,
//           mondayItem,
//           fields,
//         })

//         if (f.key === 'SocialPost' || f.key === 'Status') {
//           if (hootsuiteMessage.text !== fieldObject.text) {
//             return `"${[fieldObject.id]}": "${hootsuiteMessage[f.value]}"`
//           }
//         } else if (f.key === 'Date') {
//           const mondayDateObject = formatHootsuiteDateToMondayObject({
//             mondayId,
//             hootsuiteMessage,
//           })
//           return `"${[fieldObject.id]}": ${mondayDateObject}`
//         } else if (f.key === 'Media') {
//           const selectedMediaIds = await getFieldObject({
//             hootsuiteField: 'MediaIds',
//             mondayItem,
//             fields,
//           })

//           const hsMediaIds = hootsuiteMessage?.media
//             ? hootsuiteMessage.media.map((m) => m.id)
//             : ['']
//           const mnMediaIds = selectedMediaIds.text.split(',')

//           if (
//             !equalsIgnoreOrder(
//               shortenAWSMediaIds({ idArray: hsMediaIds }),
//               shortenAWSMediaIds({ idArray: mnMediaIds })
//             )
//           ) {
//             // Update mediaIds first
//             const hsMediaIds = hootsuiteMessage?.media
//               ? hootsuiteMessage.media.map((m) => m.id)
//               : ['']
//             const hsMediaIdsString = hsMediaIds.toString()
//             const encryptedToken = await getMondayToken({
//               shortLivedToken,
//               hootsuiteUid,
//               mondayId,
//             })
//             const token = cryptr.decrypt(encryptedToken)
//             await changeColumnValue({
//               token,
//               boardId: boardId,
//               itemId: mondayItem.id,
//               columnId: selectedMediaIds.id,
//               value: hsMediaIdsString,
//             })

//             // Then clear media causing an event to fire
//             // App will check if the hs and mn mediaIds are different
//             // Then upload media, which causes another event to fire
//             // By then the mediaIds are the same causing no more changes
//             const selectedMediaField = await getFieldObject({
//               hootsuiteField: 'Media',
//               mondayItem,
//               fields,
//             })

//             await clearMondayColumnValue({
//               hootsuiteUid,
//               mondayId,
//               boardId,
//               itemId: mondayItem.id,
//               columnId: selectedMediaField.id,
//               isFileColumn: true,
//               shortLivedToken,
//             })

//             // Then update media column as this will trigger an event to compare mediaIds with the HS message mediaIds
//             // NEEDS monday passed in from somewhere
//             await addFilesToColumn({
//               hootsuiteUid,
//               mondayId,
//               hootsuiteMessage,
//               boardId,
//               itemId: mondayItem.id,
//               shortLivedToken,
//             })
//           }
//           return
//         }
//       })

//       const returnData = await Promise.all(updateFieldsPromises)
//       const columnValues = JSON.stringify(`{${returnData.toString()}}`)
//       return returnData.length ? columnValues : undefined
//     } else {
//       return
//     }
//   } catch (catchError) {
//     const errorMessage = `Could not compare webhook update`
//     reportError(errorMessage, catchError)
//   }
// }

// const webhookDeleteAction = async ({
//   mondayId,
//   boardId,
//   itemId,
//   messageId,
//   hootsuiteUid,
//   shortLivedToken,
// }) => {
//   try {
//     const token = cryptr.decrypt(
//       await getMondayToken({ shortLivedToken, mondayId, hootsuiteUid })
//     )

//     const mondayItem = await getExistingMondayItem({
//       token: shortLivedToken,
//       boardId,
//       itemId,
//     })

//     const fields = await getFieldMappings({
//       shortLivedToken,
//       mondayId,
//       boardId,
//     })

//     const messageIdColumn = await getFieldObject({
//       hootsuiteField: 'MessageId',
//       mondayItem,
//       fields,
//     })

//     if (messageIdColumn?.text === messageId) {
//       const lastUpdatedColumn = await getFieldObject({
//         hootsuiteField: 'LastUpdated',
//         mondayItem,
//         fields,
//       })

//       const statusColumn = await getFieldObject({
//         hootsuiteField: 'Status',
//         mondayItem,
//         fields,
//       })

//       const { timezone } = await getHootsuiteAccessTokenfromDb({
//         shortLivedToken,
//         mondayId,
//         hootsuiteUid,
//       })
//       const lastUpdatedValue = getTimestamp({ tz: timezone })

//       await changeColumnValue({
//         token,
//         boardId: parseInt(boardId),
//         itemId: parseInt(itemId),
//         columnId: messageIdColumn.id,
//         value: '',
//       })

//       const changeColumnAndUpdatedRes = await changeColumnWithLastUpdatedValue({
//         token,
//         boardId: parseInt(boardId),
//         itemId: parseInt(itemId),
//         targetColumnId: statusColumn.id,
//         targetValue: 'DELETED',
//         lastUpdatedColumnId: lastUpdatedColumn.id,
//         lastUpdatedValue,
//       })

//       return { ok: true, message: changeColumnAndUpdatedRes }
//     } else {
//       return { noUpdate: true }
//     }
//   } catch (catchError) {
//     const errorMessage = `Could not delete from Monday webhook.`
//     return reportError(errorMessage, catchError)
//   }
// }

const updateMondayFromWebhook = async (req, res) => {
  try {
    const { hootsuiteUid, mondayId, boardId, itemId } = req.query
    if (!hootsuiteUid || !mondayId || !boardId || !itemId) {
      const errorMessage = `Missing webhook param from query params: ${req.query}`
      reportError(errorMessage, req)
      return
    }
    const statusValue = req?.body?.[0]?.data?.state

    console.log(`Status Value for (${itemId}):  ${statusValue}`)
    if (statusValue === 'SENT') {
      const jwtToken = jwt.sign(mondayId, process.env.MONDAY_SIGNING_SECRET)
      const axiosHeaders = { headers: { Authorization: jwtToken } }

      // monday access token
      const atUrl = `${config.app.baseUrl}/api/monday/access-token/get-from-webhook`
      const atBody = { hootsuiteUid, mondayId }
      const atRes = await axios.post(atUrl, atBody, axiosHeaders)
      const token = cryptr.decrypt(atRes.data.at)

      // Hootsuite access token for timezone

      const hsAtUrl = `${config.app.baseUrl}/api/hootsuite/access-token/get-from-webhook`
      const hsAtBody = { hootsuiteUid, mondayId }
      const hsAtRes = await axios.post(hsAtUrl, hsAtBody, axiosHeaders)
      const timezone = hsAtRes?.data?.timezone

      const mondayItem = await getExistingMondayItem({
        token,
        boardId,
        itemId,
      })

      if (mondayItem) {
        await updateStatusField({
          mondayId,
          boardId,
          itemId,
          hootsuiteField: 'Status',
          value: statusValue,
          token,
          timezone,
        })

        res.send({ ok: true })
      } else {
        return res.send({ error: true })
      }
    } else {
      res.send()
    }
  } catch (catchError) {
    const errorMessage = `Could not update monday item from webhook`
    reportError(errorMessage, catchError)
  }
}

// // Add Files to Column in Monday
// const addFilesToColumn = async ({
//   hootsuiteUid,
//   mondayId,
//   hootsuiteMessage,
//   itemId,
//   boardId,
//   shortLivedToken,
// }) => {
//   try {
//     if (hootsuiteMessage.mediaUrls) {
//       const filesPromises = hootsuiteMessage.mediaUrls.map(async (m) => {
//         const axiosHeaders = {
//           headers: { Authorization: shortLivedToken },
//         }
//         return await axios
//           .post(
//             `${config.app.baseUrl}/api/monday/files/add`,
//             {
//               hootsuiteUid,
//               mondayId,
//               mediaUrl: m.url,
//               itemId,
//               boardId,
//             },
//             axiosHeaders
//           )
//           .then((fileAddData) => {
//             return { ...fileAddData, itemId, ok: true }
//           })
//       })
//       const filesRes = await Promise.all(filesPromises)

//       return filesRes
//     } else {
//       return { itemId }
//     }
//   } catch (catchError) {
//     const errorMessage = `Could not add file to Monday column.`
//     reportError(errorMessage, catchError)
//     return { itemId }
//   }
// }

module.exports = {
  updateMondayFromWebhook,
}
