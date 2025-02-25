const { default: axios } = require('axios')
const { reportError } = require('../utils')
const config = require('../config')
const Cryptr = require('cryptr')
const cryptr = new Cryptr(process.env.CRYPTR_KEY)
const jwt = require('jsonwebtoken')

const checkForMissingParams = ({ req, res }) => {
  const hootsuiteUid = req.query.hootsuiteUid || req.body.hootsuiteUid
  const mondayId = res?.locals?.monday_user_id
  if (!hootsuiteUid || !mondayId) {
    const errorMessage = `Missing Hootsuite UID or monday.com ID.`
    reportError(errorMessage, req)
    res.status(400).json({ errorMessage })
    return false
  }
  return true
}

const getTokensFromDb = async ({ req, hootsuiteUid, mondayId }) => {
  const url = `${config.app.baseUrl}/api/monday/access-token/get`
  const axiosHeaders = { headers: { Authorization: req.headers.authorization } }
  const res = await axios.post(url, { hootsuiteUid, mondayId }, axiosHeaders)
  return res.data && res.data
}

const checkMondayMiddlewareAccessToken = async ({ at }) => {
  try {
    if (at) {
      const res = await axios({
        url: config.monday.apiUrl,
        method: 'GET',
        headers: {
          'API-Version': config.monday.apiVersion,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: cryptr.decrypt(at),
        },
        data: {
          query: `{ me { id, name, photo_thumb } }`,
        },
      })
      return res?.data?.data?.me?.id ? true : false
    } else {
      return false
    }
  } catch (catchError) {
    const errorMessage = 'Could not Check Monday Auth.'
    console.log(errorMessage, catchError)
    return false
  }
}

// This is the non-middleware checkSignature only used in existing middleware
const checkMondaySignature = async (req, res) => {
  try {
    const { authorization } = req.headers
    const token = jwt.decode(authorization)
    if (token?.shortLived) {
      res.locals.monday_user_id = token.uid
    } else {
      // const token = jwt.verify(authorization, process.env.MONDAY_CLIENT_SECRET)
      const token = jwt.decode(authorization)
      res.locals.monday_user_id = token.dat.user_id
    }
    return { ok: true }
  } catch (catchError) {
    const errorMessage = `Could not check monday signature.`
    reportError(errorMessage, catchError)
    return { error: true, errorMessage: catchError }
  }
}

const mondayMiddleware = async (req, res, next) => {
  try {
    const isOkaySignatureRes = await checkMondaySignature(req, res)
    if (!isOkaySignatureRes?.ok) {
      res.send({ error: true, errorMessage: isOkaySignatureRes?.errorMessage })
      return
    }

    const hasParams = checkForMissingParams({ req, res })
    if (!hasParams) return

    const hootsuiteUid = req.query.hootsuiteUid || req.body.hootsuiteUid
    const mondayId = res.locals.monday_user_id
    const tokens = await getTokensFromDb({ req, hootsuiteUid, mondayId })
    if (!tokens) return
    const isAtValid = await checkMondayMiddlewareAccessToken({ at: tokens.at })
    if (isAtValid) {
      req.body.at = tokens.at
      next()
    } else {
      const errorMessage = `Monday Token not valid`
      console.log(errorMessage, isAtValid)
      return res.status(401).json({ errorMessage })
    }
  } catch (catchError) {
    const errorMessage = `Not Monday Authenticated.`
    reportError(errorMessage, catchError)
    res.status(401).json({ errorMessage })
  }
}

const getWebhookTokensFromDb = async ({ hootsuiteUid, mondayId }) => {
  const jwtToken = jwt.sign(mondayId, process.env.MONDAY_SIGNING_SECRET)
  const axiosHeaders = { headers: { Authorization: jwtToken } }
  const url = `${config.app.baseUrl}/api/monday/access-token/get-from-webhook`
  const res = await axios.post(url, { hootsuiteUid, mondayId }, axiosHeaders)
  return res.data && res.data
}

const checkWebhookForMissingParams = ({ req, res }) => {
  const hootsuiteUid = req.query.hootsuiteUid || req.body.hootsuiteUid
  const mondayId = req.query.mondayId
  if (!hootsuiteUid || !mondayId) {
    const errorMessage = `Missing Hootsuite UID or monday.com ID.`
    reportError(errorMessage, req)
    res.status(400).json({ errorMessage })
    return false
  }
  return true
}

const mondayWebhookMiddleware = async (req, res, next) => {
  try {
    const hasParams = checkWebhookForMissingParams({ req, res })
    if (!hasParams) return

    const hootsuiteUid = req.query.hootsuiteUid || req.body.hootsuiteUid
    const mondayId = req.query.mondayId
    const tokens = await getWebhookTokensFromDb({ req, hootsuiteUid, mondayId })
    if (!tokens) return
    const isAtValid = await checkMondayMiddlewareAccessToken({ at: tokens.at })
    if (isAtValid) {
      req.body.at = tokens.at
      next()
    } else {
      const errorMessage = `Monday Token not valid`
      console.log(errorMessage, isAtValid)
      return res.status(401).json({ errorMessage })
    }
  } catch (catchError) {
    const errorMessage = `Not Monday Authenticated.`
    reportError(errorMessage, catchError)
    res.status(401).json({ errorMessage })
  }
}

module.exports = {
  mondayMiddleware,
  mondayWebhookMiddleware,
}
