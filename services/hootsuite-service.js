const axios = require('axios')
const config = require('../config')
const {
  reportError,
  downloadImg,
  bytesToMb,

  getMediaMetaData,
  cleanMediaMetaData,
  debugMode,
} = require('../utils')
const {
  updateMondayItem,
  getFileAssets,
  changeColumnValue,
  getExistingMondayItem,
  addUpdateToItem,
} = require('../services/monday-service')
const FileType = require('file-type')
const {
  HOOTSUITE_FIELD_DEFS,
  HOOTSUITE_VIDEO_RESTRICTIONS,
  HOOTSUITE_IMAGE_RESTRICTIONS,
} = require('../constants/hootsuite')
const { getFieldObject, getFieldMappings } = require('./user-settings.service')
const { poll } = require('../utils/hootsuite')

// This function is not used, but could be on monday.com
const getHootsuiteFieldDefs = () => {
  console.log('get them defs', HOOTSUITE_FIELD_DEFS)
  return HOOTSUITE_FIELD_DEFS
}

const getHootsuiteMessage = async ({
  shortLivedToken,
  mondayId,
  messageId,
}) => {
  try {
    const url = `${config.app.baseUrl}/api/hootsuite/messages/get-one`
    const axiosHeaders = { headers: { Authorization: shortLivedToken } }
    const axiosBody = { mondayId, messageId }
    const { data } = await axios.post(url, axiosBody, axiosHeaders)
    return data?.message
  } catch (catchError) {
    const errorMessage = `Could not get hootsuite message.`
    reportError(errorMessage, catchError)
  }
}

const getNewSendTime = ({ value }) => {
  try {
    const updatedValue = JSON.parse(value)
    if (updatedValue?.date) {
      const d = updatedValue.date
      const t = updatedValue.time ? updatedValue.time : `00:00:00`
      const scheduledSendTime = new Date(`${d}T${t}Z`)
      return scheduledSendTime
    } else {
      return undefined
    }
  } catch (catchError) {
    const errorMessage = `Could not get new send time.`
    reportError(errorMessage, { timeToParse: value, catchError })
  }
}

/**
 *
 * Creates exact copy of Hootsuite message with webhook url attached.
 *
 */
const attachWebhookToHootsuiteMessage = async ({
  mondayId,
  oldMessage,
  boardId,
  itemId,
  req,
  shortLivedToken,
}) => {
  try {
    const hootsuiteUid = oldMessage.createdByMember.id
    // const webhookUrl = `${config.app.webhookBaseUrl}/api/monday/webhook/items/update?hootsuiteUid=${hootsuiteUid}&mondayId=${mondayId}&boardId=${boardId}&itemId=${itemId}`
    // const webhookUrls = [webhookUrl]
    const socialProfileId = oldMessage?.socialProfile?.id?.toString()
    const text = oldMessage.text
    const scheduledSendTime = oldMessage.scheduledSendTime

    const media = oldMessage?.mediaUrls?.length
      ? await getHootsuiteMediaIds({
          mondayId,
          mediaUrls: oldMessage.mediaUrls,
          media: oldMessage.media,
          network: oldMessage.profile.type,
          boardId,
          req,
        })
      : undefined

    const updatedMessage = {
      ...oldMessage,
      text,
      scheduledSendTime,
      media,
      socialProfileIds: [socialProfileId],
      // webhookUrls,
    }

    if (!updatedMessage?.extendedInfo || updatedMessage.extendedInfo === null) {
      delete updatedMessage.extendedInfo
    }
    if (!updatedMessage?.tags || updatedMessage.tags === null) {
      delete updatedMessage.tags
    }
    if (!updatedMessage?.targeting || updatedMessage.targeting === null) {
      delete updatedMessage.targeting
    }
    if (!updatedMessage?.privacy || updatedMessage.privacy === null) {
      delete updatedMessage.privacy
    }
    if (!updatedMessage?.location || updatedMessage.location === null) {
      delete updatedMessage.location
    }
    if (!updatedMessage?.reviewers || updatedMessage.reviewers === null) {
      delete updatedMessage.reviewers
    }

    delete updatedMessage.id
    delete updatedMessage.state
    delete updatedMessage.socialProfile
    delete updatedMessage.postUrl
    delete updatedMessage.postId
    delete updatedMessage.createdByMember
    delete updatedMessage.lastUpdatedByMember
    delete updatedMessage.sequenceNumber
    delete updatedMessage.profile
    delete updatedMessage.mediaUrls

    const url = `${config.app.baseUrl}/api/hootsuite/messages/create`
    const axiosHeaders = { headers: { Authorization: shortLivedToken } }
    const newMessageRes = await axios.post(
      url,
      {
        isCreate: true,
        mondayId,
        hootsuiteUid,
        createData: updatedMessage,
      },
      axiosHeaders
    )

    if (newMessageRes.data.ok) {
      await updateMondayItem({
        mondayId,
        hootsuiteUid,
        boardId,
        itemId,
        hootsuiteField: 'MessageId',
        value: newMessageRes.data.message[0].id,
        shortLivedToken,
      })

      await deleteHootsuiteMessage({ mondayId, messageId: oldMessage.id })

      return { deletedMessageId: oldMessage.id, ok: true }
    }

    return { error: true }
  } catch (catchError) {
    const errorMessage = `Could not create hootsuite message.`
    return reportError(errorMessage, catchError)
  }
}

/**
 *
 * Creates new Hootsuite message when Create button is clicked in Monday
 *
 */
const createHootsuiteMessage = async ({
  hootsuiteUid,
  mondayId,
  hootsuiteItem,
  scheduledSendTime,
  shortLivedToken,
  boardId,
  itemId,
}) => {
  try {
    const m = { hootsuiteItem }
    debugMode({ hootsuiteUid, m })
    if (hootsuiteItem.socialProfileId) {
      const webhookUrl = `${config.app.webhookBaseUrl}/api/monday/webhook/items/update?hootsuiteUid=${hootsuiteUid}&mondayId=${mondayId}&boardId=${boardId}&itemId=${itemId}`
      const webhookUrls = [webhookUrl]
      const media = hootsuiteItem?.media ? hootsuiteItem.media : undefined

      const updatedMessage = {
        text: hootsuiteItem?.text,
        scheduledSendTime,
        socialProfileIds: [hootsuiteItem.socialProfileId],
        webhookUrls,
        media,
      }
      delete updatedMessage.id
      delete updatedMessage.mediaUrls

      const url = `${config.app.baseUrl}/api/hootsuite/messages/create`
      const axiosHeaders = { headers: { Authorization: shortLivedToken } }
      const createRes = await axios.post(
        url,
        {
          isCreate: true,
          mondayId,
          hootsuiteUid,
          createData: updatedMessage,
        },
        axiosHeaders
      )

      return createRes.data
    } else {
      //
      // Actively turning off error reporting.
      //
      // return reportError(errorMessage, hootsuiteItem)

      const errorMessage = `Missing social profile ID.`
      console.log(errorMessage, hootsuiteItem)
    }
  } catch (catchError) {
    const errorMessage = `Could not update hootsuite message`
    return reportError(errorMessage, catchError)
  }
}

const getNewMediaIdsArray = async ({
  mondayId,
  boardId,
  itemId,
  shortLivedToken,
}) => {
  try {
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

    const mediaIdsData = await getFieldObject({
      hootsuiteField: 'MediaIds',
      mondayItem,
      fields,
    })

    if (mediaIdsData?.text) {
      const mediaIdsArray = mediaIdsData.text.split(',')
      const hsMediaIds = mediaIdsArray.map((m) => ({ id: m }))
      return hsMediaIds
    } else {
      return
    }
  } catch (catchError) {
    const errorMessage = `Could not get new media IDs.`
    reportError(errorMessage, catchError)
  }
}

/**
 *
 * Creates new Hootsuite message with updates from Monday.com column value
 *
 */
const updateHootsuiteMessage = async ({
  mondayId,
  hootsuiteMessage,
  value,
  type,
  boardId,
  itemId,
  shortLivedToken,
}) => {
  try {
    const hootsuiteUid = hootsuiteMessage.createdByMember.id
    // const webhookUrl = `${config.app.webhookBaseUrl}/api/monday/webhook/items/update?hootsuiteUid=${hootsuiteUid}&mondayId=${mondayId}&boardId=${boardId}&itemId=${itemId}`
    // const webhookUrls = [webhookUrl]
    const socialProfileId = hootsuiteMessage?.socialProfile?.id?.toString()
    const extendedInfo =
      hootsuiteMessage &&
      hootsuiteMessage.extendedInfo &&
      hootsuiteMessage.extendedInfo !== null
        ? hootsuiteMessage.extendedInfo
        : undefined

    const text =
      type === 'long_text' ? JSON.parse(value)?.text : hootsuiteMessage.text
    const scheduledSendTime =
      type === 'date'
        ? getNewSendTime({ value })
        : hootsuiteMessage.scheduledSendTime

    const media =
      type === 'file'
        ? await getNewMediaIdsArray({
            shortLivedToken,
            mondayId,
            boardId,
            itemId,
          })
        : hootsuiteMessage.media

    const updatedMessage = {
      ...hootsuiteMessage,
      text,
      scheduledSendTime,
      socialProfileIds: [socialProfileId],
      // webhookUrls,
      media,
      extendedInfo,
    }
    delete updatedMessage.id
    delete updatedMessage.mediaUrls

    const url = `${config.app.baseUrl}/api/hootsuite/messages/create`
    const axiosHeaders = { headers: { Authorization: shortLivedToken } }
    const { data } = await axios.post(
      url,
      {
        isCreate: true,
        mondayId,
        hootsuiteUid,
        createData: updatedMessage,
      },
      axiosHeaders
    )
    return { updatedMessageId: data.message[0].id }
  } catch (catchError) {
    const errorMessage = `Could not update hootsuite message.`
    return reportError(errorMessage, catchError)
  }
}

const deleteHootsuiteMessage = async ({
  shortLivedToken,
  mondayId,
  messageId,
}) => {
  try {
    const url = `${config.app.baseUrl}/api/hootsuite/messages/delete`
    const axiosHeaders = { headers: { Authorization: shortLivedToken } }
    const axiosBody = { mondayId, messageId }
    const { data } = await axios.post(url, axiosBody, axiosHeaders)
    return data
  } catch (catchError) {
    const errorMessage = `Could not delete hootsuite message with ID: ${messageId}(${typeof messageId})`
    reportError(errorMessage, catchError)
  }
}

const updateSocialField = async (props) => {
  try {
    const {
      mondayId,
      value,
      type,
      boardId,
      itemId,
      hootsuiteMessage,
      shortLivedToken,
    } = props

    if (hootsuiteMessage) {
      const newMessageParams = {
        mondayId,
        hootsuiteMessage,
        value,
        type,
        boardId,
        itemId,
        shortLivedToken,
      }
      const newMessage = await updateHootsuiteMessage(newMessageParams)
      return newMessage
    } else {
      // const errorMessage = `Message with ID: ${messageId} does not exist anymore on Hootsuite.`
      // return reportError(errorMessage)
    }
  } catch (catchError) {
    const errorMessage = 'Could not Update Social Field'
    return reportError(errorMessage, catchError)
  }
}

const getHootsuiteMediaIds = async ({
  mondayId,
  mediaUrls,
  media,
  network,
  boardId,
  req,
}) => {
  try {
    const mediaUrlPromises = await mediaUrls.map(async (m, i) => {
      if (network === 'TWITTER') {
        return await uploadMediaToHootsuite({
          mondayId,
          mediaUrl: m.url,
          boardId,
          shortLivedToken: req.headers.authorization,
          network,
        })
      } else {
        // console.log('== use existing mediaId from HS', media[i].id)
        return { id: media[i].id }
      }
    })
    const urls = await Promise.all(mediaUrlPromises)
    return urls.map((u) => u)
  } catch (catchError) {
    const errorMessage = `Could not get Hootsuite media ids`
    reportError(errorMessage, catchError)
  }
}

const createMediaErrorUpdate = ({ fileAsset, uploadRes }) => {
  try {
    const a = 'Could not upload file to Hootsuite.\n'
    const b = `${uploadRes.errorMessage}\n`
    const c = `Please remove the file and try uploading another file.\n\n`

    const d = `File name: ${fileAsset.name}\n`
    const e = uploadRes?.file?.sizeBytes
      ? `File Size: ${bytesToMb(uploadRes.file.sizeBytes)}\n`
      : ''
    const f = `File url: ${fileAsset.public_url}\n`
    const updateMessage = `${a} ${b} ${c} ${d} ${e} ${f}`
    return updateMessage
  } catch (catchError) {
    const errorMessage = `Could not create media error update`
    reportError(errorMessage, catchError)
  }
}

const uploadAllMedia = async ({
  mondayId,
  fileAssets,
  boardId,
  itemId,
  token,
  shortLivedToken,
  network,
}) => {
  try {
    const mediaPromises = fileAssets.map(async (fileAsset) => {
      console.log(
        '~~ File Asset ~~',
        fileAsset.file_size,
        Number(fileAsset.file_size) / 1000000,
        'MB ',
        fileAsset
      )
      if (fileAsset.file_size > 5000000) {
        const errorMessage = 'Media size too large.'
        await addUpdateToItem({ token, itemId, updateMessage: errorMessage })
        reportError(errorMessage, { fileAsset })
        return { error: errorMessage }
      }
      const uploadRes = await uploadMediaToHootsuite({
        shortLivedToken,
        mondayId,
        mediaUrl: fileAsset.public_url,
        boardId,
        network,
      })
      if (uploadRes.error) {
        const updateMessage = createMediaErrorUpdate({ fileAsset, uploadRes })
        await addUpdateToItem({ token, itemId, updateMessage })
        return uploadRes
      }
      return uploadRes
    })

    const mediaIds = await Promise.all(mediaPromises)
    const mediaIdsStringArray = mediaIds.map((m) => {
      if (m.error) {
        const errorMessage = `Could not upload ${m.id}`
        console.log('up error', errorMessage, m)
        return
      } else {
        return m.id
      }
    })
    return mediaIdsStringArray
  } catch (catchError) {
    const errorMessage = `Could not upload all media to Hootsuite`
    reportError(errorMessage, catchError)
  }
}

const handleUploadToHSError = (error) => {
  try {
    if (
      error ===
      'Error [ERR_FR_MAX_BODY_LENGTH_EXCEEDED]: Request body larger than maxBodyLength limit'
    ) {
      const errorMessage = `File too large`
      return { error: true, errorMessage }
    }
    const errorMessage = `Could not upload media to Hootsuite.`
    reportError(errorMessage, error)
    return { error: true, errorMessage }
  } catch (catchError) {
    const errorMessage = `Could not handle upload to HS error`
    reportError(errorMessage, catchError)
  }
}

const isMediaNotSupportedForNetwork = ({ network, mediaMetaData }) => {
  try {
    if (mediaMetaData.isVideo) {
      const {
        maxSizeMBs,
        // minHeightPixels,
        // maxHeightPixels,
        // minWidthPixels,
        // maxWidthPixels,
        // aspectRatio,
        // minDurationSecs,
        // maxDurationSecs,
      } = HOOTSUITE_VIDEO_RESTRICTIONS
      // Check video file size for network
      if (
        maxSizeMBs?.[network] !== null &&
        maxSizeMBs?.[network] < mediaMetaData.sizeMbs
      ) {
        return { error: true, errorMessage: `Video too large` }
      }
      // if (
      //   minHeightPixels?.[network] !== null &&
      //   minHeightPixels?.[network] > mediaMetaData.heightPixels
      // ) {
      //   return { error: true, errorMessage: `Video height too small` }
      // }
      // if (
      //   maxHeightPixels?.[network] !== null &&
      //   maxHeightPixels?.[network] < mediaMetaData.heightPixels
      // ) {
      //   return { error: true, errorMessage: `Video height too large` }
      // }
      // if (
      //   minWidthPixels?.[network] !== null &&
      //   minWidthPixels?.[network] > mediaMetaData.widthPixels
      // ) {
      //   return { error: true, errorMessage: `Video width too small` }
      // }
      // if (
      //   maxWidthPixels?.[network] !== null &&
      //   maxWidthPixels?.[network] < mediaMetaData.widthPixels
      // ) {
      //   return { error: true, errorMessage: `Video width too large` }
      // }
      // if (
      //   aspectRatio?.[network] !== null &&
      //   !aspectRatio?.[network]?.includes(mediaMetaData.aspectRatio)
      // ) {
      //   return { error: true, errorMessage: `Video aspect ratio not supported` }
      // }
      // if (
      //   minDurationSecs?.[network] !== null &&
      //   minDurationSecs?.[network] > mediaMetaData.durationSecs
      // ) {
      //   return { error: true, errorMessage: `Video duration too short` }
      // }
      // if (
      //   maxDurationSecs?.[network] !== null &&
      //   maxDurationSecs?.[network] < mediaMetaData.durationSecs
      // ) {
      //   return { error: true, errorMessage: `Video duration too long` }
      // }
      return // Return nothing as video does not have any known restrictions
    } else if (mediaMetaData.isImage) {
      const {
        imageMaxSizeMBs,
        // imageMinHeightPixels,
        // imageMaxHeightPixels,
        // aspectRatio,
      } = HOOTSUITE_IMAGE_RESTRICTIONS
      // Check image file size for network
      if (imageMaxSizeMBs < mediaMetaData.sizeMbs) {
        return { error: true, errorMessage: `Image too large` }
      }
      // if (
      //   imageMinHeightPixels?.[network] !== null &&
      //   imageMinHeightPixels?.[network] > mediaMetaData.heightPixels
      // ) {
      //   return { error: true, errorMessage: `Image height too small` }
      // }
      // if (
      //   imageMaxHeightPixels?.[network] !== null &&
      //   imageMaxHeightPixels?.[network] < mediaMetaData.heightPixels
      // ) {
      //   return { error: true, errorMessage: `Image height too large` }
      // }
      // if (
      //   aspectRatio?.[network] !== null &&
      //   mediaMetaData.aspectRatio !== null &&
      //   !aspectRatio?.[network]?.includes(mediaMetaData.aspectRatio)
      // ) {
      //   return { error: true, errorMessage: `Image aspect ratio not supported` }
      // }
    } else {
      return { error: true, errorMessage: `Unsupported file type.` }
    }
    // Return nothing as media does not have any known restrictions
    return
  } catch (catchError) {
    const errorMessage = `Could not check if image is supported for the network provided.`
    reportError(errorMessage, catchError)
  }
}

const uploadMediaToHootsuite = async ({
  shortLivedToken,
  mondayId,
  mediaUrl,
  network,
}) => {
  try {
    // Download image
    const imageBuffer = await downloadImg(mediaUrl)
    // Get filetype and mimetype
    const { ext, mime } = await FileType.fromBuffer(imageBuffer)
    const rawMediaMetaData = await getMediaMetaData({ imageBuffer, ext })
    const sizeBytes = imageBuffer.length
    const mimeType = mime

    const mediaMetaData = cleanMediaMetaData({
      rawMediaMetaData,
      ext,
      mime,
      sizeBytes,
    })
    console.log('=== CLEAN mediaMetaData', mediaMetaData)

    const file = {
      network,
      mimeType,
      sizeBytes,
      mediaUrl,
      mediaMetaData,
    }

    const possibleMediaError = isMediaNotSupportedForNetwork({
      network,
      mediaMetaData,
    })

    // The majority of media restriction checking is off now as it was blocking.
    // Just checking size as it's crashing the app
    if (possibleMediaError) {
      return possibleMediaError
    } else {
      // Create HS s3 url to post to
      const upUrl = `${config.app.baseUrl}/api/hootsuite/media/create-url`
      const axiosHeaders = { headers: { Authorization: shortLivedToken } }
      const bodyData = {
        isCreate: true,
        createData: { sizeBytes, mimeType },
        mondayId,
      }
      const { data } = await axios.post(upUrl, bodyData, axiosHeaders)
      const uploadUrlData = data.data
      const uploadUrl = uploadUrlData.uploadUrl

      // Take media URL post it to the upload to that url
      const mediaUploadUrl = `${config.app.baseUrl}/api/hootsuite/media/upload`
      const mediaUploadData = {
        mimeType,
        sizeBytes,
        uploadUrl,
        imageBuffer,
        mediaUrl,
      }
      const mediaHeaders = {
        headers: { Authorization: shortLivedToken },
      }

      await axios.post(mediaUploadUrl, mediaUploadData, mediaHeaders)

      // Verify the thing is uploaded.
      const mediaStatusRes = await poll({
        shortLivedToken,
        mondayId,
        mediaId: uploadUrlData.id,
      })

      if (mediaStatusRes?.data?.state === 'READY') {
        return mediaStatusRes.data
      } else {
        const errorMessage = `Could not upload media`
        return { error: true, errorMessage, file }
      }
    }
  } catch (catchError) {
    return handleUploadToHSError(catchError)
  }
}

const getHootsuiteItem = async ({
  shortLivedToken,
  mondayId,
  mondayItem,
  boardId,
}) => {
  try {
    if (!shortLivedToken || !mondayId || !mondayItem || !boardId) {
      const errorMessage = `Could not get Hootsuite Item.`
      const error = {
        shortLivedToken,
        mondayId,
        mondayItem,
        boardId,
      }
      reportError(errorMessage, error)
      return
    }
    const fields = await getFieldMappings({
      shortLivedToken,
      mondayId,
      boardId,
    })

    const scheduledSendTimeObject = await getFieldObject({
      hootsuiteField: 'Date',
      mondayItem,
      fields,
    })

    const socialText = await getFieldObject({
      hootsuiteField: 'SocialPost',
      mondayItem,
      fields,
    })

    const socialProfileId = await getFieldObject({
      hootsuiteField: 'SocialProfileId',
      mondayItem,
      fields,
    })

    if (!socialProfileId) {
      const errorMessage = `Could not create HS Message. No social profile ID.`
      //
      // Actively turning off error reporting.
      //
      // const error = {
      //   socialProfileId,
      // }
      // reportError(errorMessage, error)
      console.log(errorMessage)
      return
    }

    const mediaIds = await getFieldObject({
      hootsuiteField: 'MediaIds',
      mondayItem,
      fields,
    })

    const media = mediaIds?.text
      ? mediaIds.text.split(',').map((m) => ({ id: m }))
      : undefined

    const scheduledSendTime = scheduledSendTimeObject?.value
      ? getNewSendTime({
          value: scheduledSendTimeObject.value,
        })
      : undefined

    const text = socialText?.text || ' '
    const hootsuiteItem = {
      scheduledSendTime,
      text,
      socialProfileId: socialProfileId.text,
      media,
    }

    return hootsuiteItem
  } catch (catchError) {
    const errorMessage = `Could not get Hootsuite Item.`
    reportError(errorMessage, catchError)
    return
  }
}

const fetchHootsuiteMe = ({ data }) => {
  try {
    const method = 'GET'
    const url = `https://platform.hootsuite.com/v1/me`
    const headers = { Authorization: `Bearer ${data.access_token}` }
    const fetchRes = axios({ method, url, headers })
    return fetchRes
  } catch (catchError) {
    const errorMessage = `Could not fetch Hootsuite me`
    return reportError(errorMessage, catchError)
  }
}

const getHootsuiteAccessTokenfromDb = async ({
  shortLivedToken,
  mondayId,
  hootsuiteUid,
}) => {
  try {
    const url = `${config.app.baseUrl}/api/hootsuite/access-token/get`
    const axiosHeaders = { headers: { Authorization: shortLivedToken } }
    const axiosBody = { mondayId, hootsuiteUid }
    const atRes = await axios.post(url, axiosBody, axiosHeaders)
    return atRes.data
  } catch (catchError) {
    const errorMessage = `Could not get Hootsuite Access Token from DB.`
    reportError(errorMessage, catchError)
  }
}

const handleFileChange = async ({
  mondayId,
  boardId,
  itemId,
  token,
  columnValue,
  shortLivedToken,
  mondayItem,
}) => {
  try {
    // if (messageId && mondayItem) {
    // Compare existing mediaIds and current hs media ids
    // const hootsuiteMessage = await getHootsuiteMessage({
    //   mondayId,
    //   messageId,
    // })

    // const hsMediaIds = hootsuiteMessage?.media
    //   ? hootsuiteMessage.media.map((m) => m.id)
    //   : ['']

    // const selectedMediaIdsField = await getFieldObject({
    //   mondayId,
    //   hootsuiteField: 'MediaIds',
    //   mondayItem,
    //   boardId,
    // })
    // const mnMediaIds = selectedMediaIdsField.text.split(',')

    // // Does hs media IDs === monday mediaIds
    // if (
    //   equalsIgnoreOrder(
    //     shortenAWSMediaIds({ idArray: hsMediaIds }),
    //     shortenAWSMediaIds({ idArray: mnMediaIds })
    //   )
    // ) {
    //   return {}
    // }
    // }

    const fields = await getFieldMappings({
      shortLivedToken,
      mondayId,
      boardId,
    })

    if (!fields?.selectedMediaIdsField?.id) {
      const errorMessage = `Could not handle file change as fields not mapped.`
      const catchError = fields
      addUpdateToItem({ token, itemId, updateMessage: errorMessage })
      reportError(errorMessage, catchError)
    }

    const mediaIdsColumnId = fields.selectedMediaIdsField.id

    // At least one file exists
    if (columnValue.files) {
      const fileAssets = await getFileAssets({ token, value: columnValue })
      const network = await getFieldObject({
        hootsuiteField: 'Channel',
        mondayItem,
        fields,
      })

      if (fileAssets) {
        const mediaData = await uploadAllMedia({
          mondayId,
          fileAssets,
          boardId,
          token,
          itemId,
          shortLivedToken,
          network: network.text,
        })

        if (mediaData) {
          await changeColumnValue({
            token,
            boardId,
            itemId,
            columnId: mediaIdsColumnId,
            value: mediaData.toString(),
          })
          return mediaData
        } else {
          return {}
        }
      } else {
        // Error returning file assets
        const errorMessage = `Could not return file assets`
        reportError(errorMessage, columnValue)
        return {}
      }
    } else {
      // Removed all files
      await changeColumnValue({
        token,
        boardId,
        itemId,
        columnId: mediaIdsColumnId,
        value: '',
      })
      return {}
    }
  } catch (catchError) {
    const errorMessage = `Could not handle file change.`
    reportError(errorMessage, catchError)
  }
}

module.exports = {
  updateSocialField,
  getHootsuiteMessage,
  createHootsuiteMessage,
  updateHootsuiteMessage,
  attachWebhookToHootsuiteMessage,
  deleteHootsuiteMessage,
  getNewSendTime,
  getHootsuiteItem,
  fetchHootsuiteMe,
  getHootsuiteAccessTokenfromDb,
  getHootsuiteFieldDefs,
  uploadAllMedia,
  uploadMediaToHootsuite,
  handleFileChange,
  getHootsuiteMediaIds,
  isMediaNotSupportedForNetwork,
}
