const { default: axios } = require('axios')
const config = require('../config')
const authService = require('../services/auth-service')
const { fetchHootsuiteMe } = require('../services/hootsuite-service')
const {
  getHootsuiteAccessTokenfromDb,
} = require('../services/hootsuite-service')
const Cryptr = require('cryptr')
const cryptr = new Cryptr(process.env.CRYPTR_KEY)

const authorize = async (req, res) => {
  const { userId, shortLivedToken, backToUrl } = req.session
  const mondayId = userId
  const hasToken = await getHootsuiteAccessTokenfromDb({
    shortLivedToken,
    mondayId,
  })
  if (hasToken.at) {
    const url = `${config.app.baseUrl}/api/hootsuite/me`
    const axiosBody = {
      mondayId: userId,
      at: hasToken.at,
    }
    const axiosHeaders = {
      headers: { Authorization: shortLivedToken },
    }
    const isTokenValidRes = await axios.post(url, axiosBody, axiosHeaders)

    if (isTokenValidRes.data.ok) {
      return res.redirect(backToUrl)
    } else {
      const authorizationUrl = authService.getAuthorizationUrl(
        userId,
        backToUrl
      )
      return res.redirect(authorizationUrl)
    }
  } else {
    const authorizationUrl = authService.getAuthorizationUrl(userId, backToUrl)
    return res.redirect(authorizationUrl)
  }
}

const callback = async (req, res) => {
  try {
    const { code, state } = req.query

    const url = new URL(state)
    const userId = url.searchParams.get('userId')
    const backToUrl = url.origin + url.pathname

    const tokenData = await authService.getToken(code)

    const hootsuiteUidRes = await fetchHootsuiteMe({ data: tokenData })

    const accessToken = cryptr.encrypt(tokenData.access_token)
    const refreshToken = cryptr.encrypt(tokenData.refresh_token)
    await axios.post(
      `${config.app.baseUrl}/api/hootsuite/access-token/create`,
      {
        mondayId: userId,
        hootsuiteUid: hootsuiteUidRes.data.data.id,
        accessToken,
        refreshToken,
      }
    )

    return res.redirect(backToUrl)
  } catch (err) {
    console.error(err)
    return res.status(500).send({ message: 'internal server error' })
  }
}

module.exports = {
  authorize,
  callback,
}
