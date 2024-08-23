const axios = require('axios')
const { reportError } = require('..')
const config = require('../../config')

const getTokenFromRefresh = async ({ req, mondayId, rt }) => {
  try {
    const url = `${config.app.baseUrl}/api/hootsuite/oauth/token/refresh`
    const axiosHeaders = {
      headers: { Authorization: req.headers.authorization },
    }
    const refreshRes = await axios.post(url, { rt }, axiosHeaders)

    if (refreshRes?.data?.access_token) {
      const url = `${config.app.baseUrl}/api/hootsuite/access-token/update`
      const res = await axios.post(
        url,
        {
          mondayId,
          accessToken: refreshRes.data.access_token,
          refreshToken: refreshRes.data.refresh_token,
        },
        axiosHeaders
      )
      return { data: res.data, at: refreshRes.data.access_token, ok: true }
    }
    return { error: true }
  } catch (catchError) {
    const errorMessage = `Could not get token from refresh token`
    reportError(errorMessage, { catchError, mondayId })
  }
}

const reduceTwitterMessage = (rawPayload) => {
  try {
    const r = rawPayload

    const countReplies =
      r.entities && r.entities.user_mentions
        ? r.entities.user_mentions.length
        : 0

    const attachmentsMedia =
      r.extended_entities && r.extended_entities.media
        ? r.extended_entities.media.map((item) => ({
            type: item.type === 'photo' ? 'image' : null,
            url: item.media_url_https,
            thumbnail: item.media_url_https,
            items: {
              target: item.media_url_https,
              thumbnailsrc: item.media_url_https,
            },
            title: item.title || '',
            indicies: item.indicies || null,
          }))
        : []

    const attachmentsUrls =
      r.entities && r.entities.urls
        ? r.entities.urls.map((item) => ({
            type: 'link',
            url: item.url,
            title: '',
            thumbnail: '',
            items: {
              target: item.url,
              thumbnailsrc: '',
            },
            indicies: item.indicies || null,
          }))
        : []

    const data = {
      post: {
        network: 'TWITTER',
        id: r.id_str,
        datetime: r.created_at,
        source: r.source,
        counts: {
          likes: r.favorite_count,
          shares: r.retweet_count,
          replies: countReplies,
        },
        content: {
          body: r.text,
          bodyhtml: r.text, // No HTML?
        },
        attachments: [...attachmentsMedia, ...attachmentsUrls],
        user: {
          userid: r.user.id,
          username: r.user.name,
        },
      },
      profile: {
        ...r.user,
        picture: r.user.profile_image_url_https || '',
      },
    }
    return data
  } catch (catchError) {
    const errorMessage = `Could not reduce Twitter payload`
    reportError(errorMessage, catchError)
  }
}

const reduceTwitterProfile = (data) => {
  try {
    const profile = {
      avatarUrl: data.data.profile_image_url,
      socialNetworkUsername: data.data.username,
    }
    return profile
  } catch (catchError) {
    const errorMessage = `Could not reduce Twitter payload`
    reportError(errorMessage, catchError)
  }
}

/////////////////

const poll = ({
  shortLivedToken,
  interval = 3000,
  maxAttempts = 10,
  mondayId,
  mediaId,
}) => {
  let attempts = 0

  const executePoll = async (resolve, reject) => {
    const statusUrl = `${config.app.baseUrl}/api/hootsuite/media/status`
    const axiosHeaders = { headers: { Authorization: shortLivedToken } }
    const axiosBody = { mondayId, mediaId }
    const { data } = await axios.post(statusUrl, axiosBody, axiosHeaders)
    attempts++

    if (data.data.state === 'READY') {
      return resolve({ ok: true, ...data })
    } else if (maxAttempts && attempts === maxAttempts) {
      return reject(new Error('Exceeded max attempts'))
    } else {
      setTimeout(executePoll, interval, resolve, reject)
    }
  }

  return new Promise(executePoll)
}

module.exports = {
  getTokenFromRefresh,
  reduceTwitterMessage,
  reduceTwitterProfile,
  poll,
}
