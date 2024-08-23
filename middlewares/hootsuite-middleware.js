const { default: axios } = require('axios')
const { reportError } = require('../utils')
const { getTokenFromRefresh } = require('../utils/hootsuite')
const Cryptr = require('cryptr')
const config = require('../config')
const cryptr = new Cryptr(process.env.CRYPTR_KEY)
const jwt = require('jsonwebtoken')

const checkForMissingParams = ({ req, res }) => {
  const mondayId = res?.locals?.monday_user_id
  if (!mondayId) {
    const errorMessage = `Missing Monday ID`
    reportError(errorMessage, req)
    res.status(400).json({ errorMessage })
    return false
  }
  return true
}

const getTokensFromDb = async ({ req, mondayId }) => {
  const url = `${config.app.baseUrl}/api/hootsuite/access-token/get`
  const axiosHeaders = { headers: { Authorization: req.headers.authorization } }
  const res = await axios.post(url, { mondayId }, axiosHeaders)
  return res.data && res.data
}

const checkHootsuiteMiddlewareAccessToken = async ({ at }) => {
  try {
    const url = `https://platform.hootsuite.com/v1/me`
    const decryptedAccessToken = cryptr.decrypt(at)

    const res = await axios({
      method: 'GET',
      url,
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${decryptedAccessToken}`,
      },
    })
    return res?.data?.data?.id ? true : false
  } catch (catchError) {
    const errorMessage = 'Could not Check Auth.'
    if (catchError?.response?.data?.error_description === 'token_expired') {
      // console.log('Token Expired')
    } else {
      console.log('Check AT error', catchError?.response?.data)
      console.log(errorMessage, catchError)
    }
    return false
  }
}

// This is the non-middleware checkSignature only used in existing middleware
const checkHootsuiteSignature = async (req, res) => {
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
    return true
  } catch (catchError) {
    const errorMessage = `Could not check hootsuite signature.`
    reportError(errorMessage, catchError)
    return false
  }
}

const hootsuiteMiddleware = async (req, res, next) => {
  try {
    const isOkaySignature = checkHootsuiteSignature(req, res)
    if (!isOkaySignature) {
      res.status(401).json({ error: 'Not hootsuite Authenticated' })
    }

    const hasParams = checkForMissingParams({ req, res })
    if (!hasParams) return
    const mondayId = res.locals.monday_user_id
    const tokens = await getTokensFromDb({ req, mondayId })
    if (!tokens) return
    const isAtValid = await checkHootsuiteMiddlewareAccessToken({
      at: tokens.at,
    })
    if (isAtValid) {
      req.body.at = tokens.at
      next()
    } else {
      const tokenRes = await getTokenFromRefresh({
        req,
        mondayId,
        rt: tokens.rt,
      })

      if (!tokenRes?.ok) {
        const errorMessage = `Could not refresh token`
        reportError(errorMessage, { tokenRes, mondayId })
        return res.status(401).json({ errorMessage })
      } else {
        req.body.at = tokenRes.at
        next()
      }
    }
  } catch (catchError) {
    const errorMessage = `Not Hootsuite Authenticated.`
    reportError(errorMessage, catchError)
    res.status(500).json({ errorMessage })
  }
}

module.exports = {
  hootsuiteMiddleware,
}
