const { AuthorizationCode } = require('simple-oauth2')
const qs = require('qs')
const axios = require('axios')
const config = require('../config')
const { reportError } = require('../utils')

const SCOPES = ['offline']

const getAuthorizationUrl = (userId, state) => {
  const client = getClient()

  const redirect_uri = config.hootsuite.oauth.redirectUrl
  const authorizationUrl = client.authorizeURL({
    redirect_uri,
    scope: SCOPES,
    state: `${state}?userId=${userId}`,
  })

  return authorizationUrl
}

const getToken = async (code) => {
  try {
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
    const method = 'POST'
    const url = `https://platform.hootsuite.com/oauth2/token`
    const headers = {
      Accept: 'application/json;charset=utf-8',
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${encodedData}`,
    }

    const tokenRes = await axios({ method, url, timeout: 5000, data, headers })

    return tokenRes.data
  } catch (catchError) {
    const errorMessage = `Could not getToken for Hootsuite integration.`
    reportError(errorMessage, catchError)
  }
}

const getClient = () => {
  return new AuthorizationCode({
    client: {
      id: process.env.HOOTSUITE_CLIENT_ID,
      secret: process.env.HOOTSUITE_CLIENT_SECRET,
    },
    auth: {
      tokenHost: process.env.HOOTSUITE_TOKEN_HOST,
      tokenPath: process.env.HOOTSUITE_TOKEN_PATH,
      authorizePath: process.env.HOOTSUITE_AUTHORIZE_PATH,
    },
  })
}

module.exports = { getAuthorizationUrl, getToken }
