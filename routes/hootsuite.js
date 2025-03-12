require('dotenv').config()
const express = require('express')
const router = express.Router()
const hootsuite = require('../wrappers/hootsuiteWrapper')
const config = require('../config')
const axios = require('axios')
const qs = require('qs')
const Cryptr = require('cryptr')
const cryptr = new Cryptr(process.env.CRYPTR_KEY)
const { reportError, downloadImg } = require('../utils/index')
const { reduceTwitterProfile } = require('../utils/hootsuite/index')
const hootsuiteAccessTokens = require('../controllers/hootsuite_access_tokens.controller.js')
const { hootsuiteMiddleware } = require('../middlewares/hootsuite-middleware')
const {
  attachWebhookToHootsuiteMessage,
  fetchHootsuiteMe,
} = require('../services/hootsuite-service')
const {
  checkSignatureMiddleware,
  addMondayIdMiddleware,
} = require('../middlewares/authentication')

/////////////////////////
// DB
/////////////////////////

// Internal routing only.  Does not contain monday Authorization header.  No Middleware auth check.
// Create new
router.post('/access-token/create', hootsuiteAccessTokens.create)

// Retrieve one based on mondayId
router.post(
  '/access-token/get',
  checkSignatureMiddleware,
  hootsuiteAccessTokens.findAll
)

// Retrieve one based on mondayId with request from webhook
router.post(
  '/access-token/get-from-webhook',
  addMondayIdMiddleware,
  hootsuiteAccessTokens.findAll
)

// Update with mondayId
router.post(
  '/access-token/update',
  checkSignatureMiddleware,
  hootsuiteAccessTokens.update
)

// Delete based on mondayId
router.post(
  '/access-token/delete',
  checkSignatureMiddleware,
  hootsuiteAccessTokens.delete
)

/////////////////////////
//
/////////////////////////
router.post('/me', hootsuiteMiddleware, (req, res) => {
  const route = `https://platform.hootsuite.com/v1/me`
  const errorMessage = 'Could not check Hootsuite Me'
  const reducer = ({ data }) => ({ ...data, ok: true })
  hootsuite.axe({ res, req, route, errorMessage, reducer })
})

router.post('/messages/scheduled', hootsuiteMiddleware, (req, res) => {
  const { startTime, endTime } = req.body
  const s = `startTime=${startTime}&endTime=${endTime}`
  const route = `https://platform.hootsuite.com/v1/messages?${s}`
  const errorMessage = 'Could not get Scheduled Hootsuite Messages'
  const reducer = ({ data }) => ({ messages: data ? data : [], ok: true })
  hootsuite.axe({ res, req, route, errorMessage, reducer })
})

router.post('/messages/get-one', hootsuiteMiddleware, (req, res) => {
  const route = `https://platform.hootsuite.com/v1/messages/${req.body.messageId}`
  const errorMessage = 'Could not get One Hootsuite Message'
  const reducer = ({ data }) => ({ message: data[0], ok: true })
  hootsuite.axe({ res, req, route, errorMessage, reducer })
})

router.post('/messages/create', hootsuiteMiddleware, (req, res) => {
  const route = `https://platform.hootsuite.com/v1/messages`
  const errorMessage = 'Could not create Hootsuite Scheduled Message'
  const reducer = ({ data }) => ({ message: data, ok: true })
  const verb = 'POST'
  hootsuite.axe({ res, req, route, errorMessage, reducer, verb })
})

router.post('/messages/delete', hootsuiteMiddleware, (req, res) => {
  const route = `https://platform.hootsuite.com/v1/messages/${req.body.messageId}`
  const errorMessage = 'Could not delete Hootsuite Scheduled Message'
  const reducer = ({ data }) => ({ ...data, ok: true })
  const verb = 'DELETE'
  hootsuite.axe({ res, req, route, errorMessage, reducer, verb })
})

router.post('/social-profiles/get', hootsuiteMiddleware, (req, res) => {
  const route = `https://platform.hootsuite.com/v1/socialProfiles/${req.body.id}`
  const errorMessage = 'Could not get Social Profile'
  const reducer = ({ data }) => ({ profile: data, ok: true })
  hootsuite.axe({ res, req, route, errorMessage, reducer })
})

router.post('/social-profiles/get-all', hootsuiteMiddleware, (req, res) => {
  const route = `https://platform.hootsuite.com/v1/socialProfiles`
  const errorMessage = 'Could not get all Social Profiles'
  const reducer = ({ data }) => ({ profiles: data, ok: true })
  hootsuite.axe({ res, req, route, errorMessage, reducer })
})

router.post('/webhook/attach', checkSignatureMiddleware, async (req, res) => {
  const { oldMessage, boardId, itemId } = req.body
  const mondayId = res.locals.monday_user_id
  console.log('shortlivedtoken!')
  const messageRes = await attachWebhookToHootsuiteMessage({
    mondayId,
    oldMessage,
    boardId,
    itemId,
    req,
  })
  if (messageRes.ok) {
    res.send({ data: messageRes, ok: true })
  } else {
    res.send({ error: true, errorMessage: messageRes })
  }
})

router.post('/media/create-url', hootsuiteMiddleware, (req, res) => {
  const route = `https://platform.hootsuite.com/v1/media`
  const errorMessage = 'Could not get Upload URL'
  const reducer = (data) => ({ ...data, ok: true })
  hootsuite.axe({ res, req, route, errorMessage, verb: 'POST', reducer })
})

router.post('/media/upload', async (req, res) => {
  try {
    const { mimeType, uploadUrl, sizeBytes, mediaUrl } = req.body
    const imageBuffer = await downloadImg(mediaUrl)

    const options = {
      method: 'PUT',
      url: uploadUrl,
      timeout: 29000,
      data: imageBuffer,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': sizeBytes,
      },
    }
    const uploadRes = await axios(options)

    res.send({ ...uploadRes.data, ok: true })
  } catch (catchError) {
    const { mimeType, uploadUrl, sizeBytes, mediaUrl } = req.body
    const errorMessage = `Could not upload media to Hootsuite`
    reportError(errorMessage, {
      mimeType,
      uploadUrl,
      sizeBytes,
      mediaUrl,
      catchError,
    })
    res.send({ error: true, errorMessage })
  }
})

router.post('/media/status', hootsuiteMiddleware, (req, res) => {
  const route = `https://platform.hootsuite.com/v1/media/${req.body.mediaId}`
  const errorMessage = 'Could not get Status of Hootsuite Upload'
  const reducer = (data) => ({ ...data, ok: true })
  hootsuite.axe({ res, req, route, errorMessage, verb: 'GET', reducer })
})

/**
 * /api/hootsuite/oauth/check-access-token
 */
router.post(
  '/check-access-token',
  checkSignatureMiddleware,
  async (req, res) => {
    const route = 'https://platform.hootsuite.com/v1/me'
    const reducer = ({ data }) => {
      return { ...data, ok: true }
    }
    const errorMessage = 'Could not Check Access Token'
    hootsuite.axe({ res, req, route, errorMessage, reducer })
  }
)

/**
 * /api/hootsuite/oauth/redirect
 */
router.get('/oauth/redirect', (req, res) => {
  res.sendFile(__dirname + '/oauth-hootsuite.html')
})

/**
 * /api/hootsuite/oauth/token
 */
router.post('/oauth/token', (req, res) => {
  try {
    const { mondayId, code } = req.body
    const clientId = process.env.HOOTSUITE_CLIENT_ID
    const clientSecret = process.env.HOOTSUITE_CLIENT_SECRET

    const encodedData = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64'
    )

    const data = qs.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.hootsuite.oauth.redirectUrl,
      scope: 'offline',
    })

    axios({
      method: 'POST',
      url: `https://platform.hootsuite.com/oauth2/token`,
      timeout: 5000,
      data,
      headers: {
        Accept: 'application/json;charset=utf-8',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${encodedData}`,
      },
    })
      .then(async ({ data }) => {
        const meRes = await fetchHootsuiteMe({ data })

        // Check if Hootsuite UID already exists

        const hsUidExists = await hootsuiteAccessTokens.checkIfHsIdExists({
          hootsuiteUid: meRes.data.data.id,
        })

        if (hsUidExists) {
          console.log('DOES EXIST. send error', hsUidExists)
          res.send({
            error: true,
            errorCode: '001',
            errorMessage:
              'Hootsuite ID exists already.  Cannot use multiple Hootsuite accounts.',
          })
        } else {
          // Create entry
          const url = `${config.app.baseUrl}/api/hootsuite/access-token/create`
          const axiosBody = {
            mondayId,
            hootsuiteUid: meRes.data.data.id,
            accessToken: cryptr.encrypt(data.access_token),
            refreshToken: cryptr.encrypt(data.refresh_token),
            timezone: meRes.data.data.defaultTimezone,
          }
          // Internal routing only.  Does not contain monday Authorization header.  No Middleware auth check.
          axios.post(url, axiosBody).then(() => {
            res.send({ ok: true })
          })
        }
      })
      .catch((error) => {
        console.log('err', error)
        res.send({ error })
      })
  } catch (error) {
    res.send({ error })
  }
})

router.post('/oauth/token/refresh', (req, res) => {
  try {
    const clientId = process.env.HOOTSUITE_CLIENT_ID
    const clientSecret = process.env.HOOTSUITE_CLIENT_SECRET
    const encodedData = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64'
    )

    const data = qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: cryptr.decrypt(req.body.rt),
      scope: 'offline',
    })

    axios({
      method: 'POST',
      url: `https://platform.hootsuite.com/oauth2/token`,
      timeout: 5000,
      data,
      headers: {
        Accept: 'application/json;charset=utf-8',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${encodedData}`,
      },
    })
      .then(({ data }) => {
        const encryptedData = {
          access_token: cryptr.encrypt(data.access_token),
          refresh_token: cryptr.encrypt(data.refresh_token),
        }
        res.send({ ...encryptedData, ok: true })
      })
      .catch((catchError) => {
        const errorMessage = `cccc Could not get new token from Refresh Token.`
        reportError(errorMessage, catchError)
        res.send({ error: catchError.data })
      })
  } catch (catchError) {
    const errorMessage = `Try Error - Could not get new token from refresh token`
    reportError(errorMessage, catchError)
    res.send({ error: catchError })
  }
})

/////////////////////////////////////////
// Twitter Hydration
/////////////////////////////////////////
router.post(
  '/twitter/profile-hydrate',
  checkSignatureMiddleware,
  async (req, res) => {
    try {
      if (!req.body.socialNetworkId) {
        const errorMessage = `Could not get socialNetworkId from req.body`
        reportError(errorMessage, req)
        return res.status(400)
      } else {
        const commonjsImport = async () => {
          const TwitterAPI = require('twitter-api-v2').TwitterApi
          const twitterClient = new TwitterAPI(process.env.TWITTER_BEARER_TOKEN)
          const readOnlyClient = twitterClient.readOnly

          const userFields = [
            'created_at',
            'description',
            'entities',
            'id',
            'location',
            'name',
            'pinned_tweet_id',
            'profile_image_url',
            'protected',
            'public_metrics',
            'url',
            'username',
            'verified',
            'verified_type',
            'withheld',
          ]

          const allFields = { 'user.fields': userFields }
          const socialProfileRes = await readOnlyClient.v2.user(
            req.body.socialNetworkId,
            allFields
          )

          const reducedTwitterProfile = reduceTwitterProfile(socialProfileRes)
          return reducedTwitterProfile
        }
        const returnData = await commonjsImport()

        return res.send(returnData)
      }
    } catch (catchError) {
      const errorMessage = `Could not hydrate Tweet.`
      reportError(errorMessage, catchError)
      return res.send({ error: true, errorMessage })
    }
  }
)

module.exports = router
