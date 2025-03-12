require('dotenv').config()
const express = require('express')
const router = express.Router()
const monday = require('../wrappers/mondayWrapper')
const config = require('../config')
const axios = require('axios')
const qs = require('qs')
const Cryptr = require('cryptr')
const cryptr = new Cryptr(process.env.CRYPTR_KEY)
const mondayAccessTokens = require('../controllers/monday_access_tokens.controller.js')
const { reportError, downloadImg } = require('../utils/index')
const {
  mondayMiddleware,
  mondayWebhookMiddleware,
} = require('../middlewares/monday-middleware')
const { updateMondayFromWebhook } = require('../services/webhook-service')
const { getFieldMappings } = require('../services/user-settings.service')
const FileType = require('file-type')
const fetch = require('node-fetch')
const {
  checkSignatureMiddleware,
  addMondayIdMiddleware,
} = require('../middlewares/authentication')

/////////////////////////
// DB
/////////////////////////

// Internal routing only.  Does not contain monday Authorization header.  No Middleware auth check.
// Create new
router.post('/access-token/create', mondayAccessTokens.create)

// Retrieve one based on mondayId
router.post(
  '/access-token/get',
  checkSignatureMiddleware,
  mondayAccessTokens.findAll
)

// Update with mondayId
router.post(
  '/access-token/update',
  checkSignatureMiddleware,
  mondayAccessTokens.update
)

// Delete based on mondayId
router.post(
  '/access-token/delete',
  checkSignatureMiddleware,
  mondayAccessTokens.delete
)

// Retrieve one based on mondayId with request from webhook
router.post(
  '/access-token/get-from-webhook',
  addMondayIdMiddleware,
  mondayAccessTokens.findAll
)

/**
 * /api/monday/check-access-token
 */
router.post('/check-access-token', checkSignatureMiddleware, (req, res) => {
  const query = `query { me { id } }`
  const eMsg = 'Could not Check Monday Access Token'
  const reducer = ({ data }) => ({ ...data.data.me, ok: true })
  monday.axe({ res, req, query, eMsg, reducer })
})

///////////////////////
// Webhook
///////////////////////

/**
 * /api/monday/items/update-one-column
 */
router.post('/items/update-one-column', mondayMiddleware, (req, res) => {
  const { boardId, itemId, columnId, value } = req.body
  const query = `mutation { change_column_value (board_id: ${boardId}, item_id: ${itemId}, column_id: ${JSON.stringify(
    columnId
  )}, value: ${JSON.stringify(`"${value}"`)}) { id } }`
  const eMsg = 'Could not Update Monday Item'
  const reducer = (response) => ({ ...response.data })
  monday.axe({ res, req, query, eMsg, reducer })
})

/**
 * /api/monday/items/update
 */

router.post(
  `/webhook/items/update`,
  mondayWebhookMiddleware,
  updateMondayFromWebhook
)

/**
 * /api/monday/me
 */
router.post('/me', mondayMiddleware, (req, res) => {
  const query = `query { me { id, name, photo_thumb  } }`
  const eMsg = 'Could not get Monday Me'
  const reducer = (response) => ({ ...response.data.data.me })
  monday.axe({ res, req, query, eMsg, reducer })
})

/**
 * /api/monday/boards
 */
router.post('/boards', mondayMiddleware, (req, res) => {
  const query = `query { boards { id, name, top_group { id } } }`
  const eMsg = 'Could not get Monday Boards'
  const reducer = (response) => {
    return [...response.data.data.boards]
  }
  monday.axe({ res, req, query, eMsg, reducer })
})

/**
 * /api/monday/users
 */
router.post('/users', mondayMiddleware, (req, res) => {
  const query = `query { users { id, name, email, photo_thumb } }`
  const eMsg = 'Could not get Monday Users'
  const reducer = (response) =>
    response.data.data.users.map((user) => ({
      ...user,
      text: user.name,
    }))
  monday.axe({ res, req, query, eMsg, reducer })
})

/**
 * /api/monday/subscribers
 */
router.post('/subscribers', mondayMiddleware, (req, res) => {
  const query = `query { users { id, name, email, photo_thumb } }`
  const eMsg = 'Could not get Monday Subscribers'
  const reducer = (response) =>
    response.data.data.users.map((user) => ({
      ...user,
      text: user.name,
    }))
  monday.axe({ res, req, query, eMsg, reducer })
})

/**
 * /api/monday/groups
 */
router.post('/groups', mondayMiddleware, (req, res) => {
  const query = `query { boards(ids: [${req.body.board}]) { groups { id, title, color } } }`
  const eMsg = 'Could not get Monday Groups'
  const reducer = (response) => {
    return response.data.data.boards[0].groups.map((group) => ({
      ...group,
      id: group.id,
      text: group.title,
      color: group.color,
    }))
  }
  monday.axe({ res, req, query, eMsg, reducer })
})

/**
 * /api/monday/columns
 */
router.post('/columns', mondayMiddleware, (req, res) => {
  const query = `query { boards(ids: [${req.body.board}]) { columns { id, title, type } } }`
  const eMsg = 'Could not get Monday Columns'
  const reducer = (response) => response.data.data.boards[0].columns

  monday.axe({ res, req, query, eMsg, reducer })
})

/**
 * /api/monday/task/create
 */
router.post('/task/create', mondayMiddleware, (req, res) => {
  try {
    const { boardId, groupId, itemTitle, allColumnData } = req.body
    const column_values = JSON.stringify(allColumnData)
    if (!column_values) {
      const errorMessage = `Could not create Task.`
      const error = allColumnData
      reportError(errorMessage, error)
    }
    const queryWithoutColumns = `mutation { create_item (board_id: ${boardId}, group_id: "${groupId}", item_name: "${itemTitle}") { id } }`
    const queryWithColumns = `mutation { create_item (board_id: ${boardId}, group_id: "${groupId}", item_name: "${itemTitle}", column_values: ${column_values}, create_labels_if_missing: true) { id } }`
    const query = allColumnData ? queryWithColumns : queryWithoutColumns
    const eMsg = 'Could not create Monday Task'
    const reducer = (response) => ({ ...response.data, ok: true })
    monday.axe({ res, req, query, eMsg, reducer })
  } catch (catchError) {
    const errorMessage = `Could not POST /task/create`
    reportError(errorMessage, catchError)
  }
})

/**
 * /api/monday/files/add
 */
router.post('/files/add', mondayMiddleware, async (req, res) => {
  try {
    const { itemId, mediaUrl, hootsuiteUid, boardId } = req.body
    const mondayId = res.locals.monday_user_id

    // set filename
    const upfile = mediaUrl
    const fileBuffer = await downloadImg(upfile)
    const { ext } = await FileType.fromBuffer(fileBuffer)
    const upFileName = `upload-${Date.now()}.${ext}`

    // set auth token and query
    const atUrl = `${config.app.baseUrl}/api/monday/access-token/get`
    const atBody = { hootsuiteUid, mondayId }
    const axiosHeaders = {
      headers: { Aurthorization: req.headers.authorization },
    }
    const atRes = await axios.post(atUrl, atBody, axiosHeaders)

    const fieldMappings = await getFieldMappings({ req, mondayId, boardId })
    const fileColumnId = fieldMappings.selectedMediaField.id

    var query = `mutation ($file: File!) { add_file_to_column (file: $file, item_id: ${itemId}, column_id: ${fileColumnId}) { id } }`

    // set URL and boundary
    var url = 'https://api.monday.com/v2/file'
    var boundary = 'xxxxxxxxxx'
    var data = ''

    // construct query part
    data += '--' + boundary + '\r\n'
    data += 'Content-Disposition: form-data; name="query"; \r\n'
    data += 'Content-Type:application/json\r\n\r\n'
    data += '\r\n' + query + '\r\n'

    // construct file part
    data += '--' + boundary + '\r\n'
    data +=
      'Content-Disposition: form-data; name="variables[file]"; filename="' +
      upFileName +
      '"\r\n'
    data += 'Content-Type:application/octet-stream\r\n\r\n'
    var payload = Buffer.concat([
      Buffer.from(data, 'utf8'),
      new Buffer.from(fileBuffer, 'binary'),
      Buffer.from('\r\n--' + boundary + '--\r\n', 'utf8'),
    ])

    // construct request options
    var options = {
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        Authorization: cryptr.decrypt(atRes.data.at),
      },
      body: payload,
    }

    // make request
    fetch(url, options)
      .then((res) => res.json())
      .then((json) => {
        res.send({ ok: true, ...json })
      })
      .catch((fetchError) => {
        res.send({ error: true, errorMessage: fetchError })
      })
  } catch (catchError) {
    const errorMessage = `Could not POST /files/add`
    reportError(errorMessage, catchError)
  }
})

const fetchMondayMe = async ({ mondayData }) => {
  try {
    const query = `query { me { id, name, photo_thumb } }`
    const url = config.monday.apiUrl
    const method = 'POST'
    const headers = {
      'API-Version': config.monday.apiVersion,
      'Content-Type': 'application/json',
      Authorization: mondayData.access_token,
    }
    const data = JSON.stringify({ query: query })
    const fetchRes = await axios({ url, method, headers, data })
    return fetchRes
  } catch (catchError) {
    const errorMessage = `Could not fetch Monday me`
    reportError(errorMessage, catchError)
    return { error: true, errorMessage }
  }
}

/**
 * /api/monday/oauth/token
 */
router.post('/oauth/token', (req, res) => {
  try {
    const { code, hootsuiteUid } = req.body
    axios
      .post(
        config.monday.oauth.accessTokenUrl,
        qs.stringify({
          grant_type: 'authorization_code',
          client_id: process.env.MONDAY_CLIENT_ID,
          redirect_uri: config.monday.oauth.redirectUrl,
          client_secret: process.env.MONDAY_CLIENT_SECRET,
          code,
        })
      )
      .then(async ({ data }) => {
        const meRes = await fetchMondayMe({ mondayData: data, hootsuiteUid })
        const axiosUrl = `${config.app.baseUrl}/api/monday/access-token/create`
        const axiosBody = {
          hootsuiteUid,
          mondayId: meRes.data.data.me.id,
          accessToken: cryptr.encrypt(data.access_token),
        }
        // Internal routing only.  Does not contain monday Authorization header.  No Middleware auth check.
        axios.post(axiosUrl, axiosBody).then(() => {
          res.send({ ok: true })
        })
      })
      .catch((error) => {
        const maybeErrorString = error?.response?.data?.errors
          ? JSON.stringify(error?.response?.data?.errors)
          : error
        console.log('Error /api/monday/oauth/token', maybeErrorString)
        const errorMessage = 'Could not get Monday Auth Token'
        reportError(errorMessage, error?.response?.data?.errors)
        res.send(maybeErrorString)
      })
  } catch (error) {
    console.log('CATCH Monday /oauth/token ', error)
  }
})

module.exports = router
