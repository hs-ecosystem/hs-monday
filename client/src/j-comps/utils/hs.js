import {
  decodeBase64,
  encodeBase64,
  getParameterByName,
  reportError,
} from './index.js'
import { hsp } from './hsp.js'
import { sha512 } from 'js-sha512'
import { format, parseISO } from 'date-fns'
import config from '../../config/index.js'

export const composeMessage = (text, options = { shortenLinks: false }) => {
  if (process.env.NODE_ENV === 'production') {
    hsp.composeMessage(text, options)
  } else {
    alert(`composeMessage: ${text} options: ${JSON.stringify(options)}`)
  }
}

export const attachFileToMessage = ({
  memberId,
  url,
  name,
  extension = 'png',
}) => {
  const secret = config.hs.secret
  if (process.env.NODE_ENV === 'production') {
    try {
      if (memberId && hsp) {
        const timestamp = Math.floor(Date.now() / 1000)
        const token = sha512('' + memberId + timestamp + url + secret)
        hsp.attachFileToMessage({
          url,
          name,
          extension,
          timestamp,
          token,
        })
      }
    } catch (error) {
      const errorMessage = `Could not attach file to Message`
      reportError(errorMessage, error)
    }
  } else {
    const timestamp = Math.floor(Date.now() / 1000)
    const token = sha512('' + memberId + timestamp + url + secret)
    alert(
      `url: ${url} \n memberId: ${memberId} \n name: ${name} \n extension: ${extension} \n timestamp: ${timestamp} \n secret: ${secret} \n token: ${token}`
    )
  }
}

export const parseHsData = (hsData) => {
  if (hsData) {
    const network = hsData.post.network
    if (network === 'TWITTER') {
      const twitterDateString = hsData.post.datetime
      const newDateString = twitterDateString.replace('+0000 ', '') + ' UTC'
      return {
        network: 'TWITTER',
        profileId: hsData.profile.id,
        profileImgSrc: hsData.profile.picture,
        profileName: hsData.profile.name,
        profileUsername: hsData.profile.screen_name,
        postId: hsData.post.id,
        postContent: hsData.post.content.body,
        postLink: `https://twitter.com/i/web/status/${hsData.post.id}`,
        postTimestamp: format(new Date(newDateString), 'MMM d, yyyy h:mm a'),
        attachments: hsData.post.attachments,
      }
    } else if (network === 'FACEBOOK') {
      return {
        network: hsData.post.network,
        profileId: hsData.profile.id,
        profileImgSrc: hsData.profile.picture,
        profileName: hsData.post.user.username,
        profileUsername: hsData.post.user.username,
        postId: hsData.post.id,
        postContent: hsData.post.content.body,
        postLink: hsData.post.href,
        postTimestamp: format(
          parseISO(hsData.post.datetime),
          'MMM d, yyyy h:mm a'
        ),
        attachments: hsData.post.attachments,
      }
    } else if (network === 'INSTAGRAM' || network === 'INSTAGRAMBUSINESS') {
      return {
        network: hsData.post.network,
        profileId: hsData.profile.id,
        profileImgSrc: hsData.profile.profile_picture,
        profileName: hsData.post.user.username,
        profileUsername: hsData.post.user.username,
        postId: hsData.post.id,
        postContent: hsData.post.content.body ? hsData.post.content.body : '',
        postLink: hsData.post.href,
        postTimestamp: format(
          parseISO(hsData.post.datetime),
          'MMM d, yyyy h:mm a'
        ),
        attachments: hsData.post.attachments,
      }
    } else if (network === 'YOUTUBE') {
      return {
        network: hsData.post.network,
        profileId: hsData.post.user.userid,
        profileImgSrc: null,
        profileName: hsData.post.user.username,
        profileUsername: hsData.post.user.username,
        postId: hsData.post.id,
        postContent: hsData.post.content.body ? hsData.post.content.body : '',
        postLink: hsData.post.href,
        postTimestamp: format(
          parseISO(hsData.post.datetime),
          'MMM d, yyyy h:mm a'
        ),
        attachments: hsData.post.attachments,
      }
    } else {
      const errorMessage = 'Error - Could not parse Hootsuite Data'
      reportError(errorMessage, hsData)
    }
  } else {
    const errorMessage = 'Error - Could not parse Hootsuite Data. No hsData.'
    reportError(errorMessage, hsData)
  }
}

/**
 *  Redux Hootsuite data to original  Hootsuite URL data
 *
 *  @param {*} store - Redux store
 * @param {*} hootsuiteParamData - Object containing Hootsuite data sent originally from the URL, then converted for use in Redux in app.
 * @returns Object containing originally named data paramaters from Hootsuite in URL.
 */
export const hsParamsForUrl = ({ hootsuiteParamData }) => {
  try {
    return {
      uid: hootsuiteParamData.hootsuiteUid,
      pid: hootsuiteParamData.hootsuitePid,
      lang: hootsuiteParamData.hootsuiteLang,
      token: hootsuiteParamData.hootsuiteToken,
      timezone: hootsuiteParamData.hootsuiteTimezone,
      ts: hootsuiteParamData.hootsuiteTimestamp,
      source: hootsuiteParamData.source,
      namespace: hootsuiteParamData.namespace,
      ...(hootsuiteParamData.mondayId && {
        mondayId: hootsuiteParamData.mondayId,
      }),
      ...(hootsuiteParamData.hootsuiteUid && {
        hootsuiteUid: hootsuiteParamData.hootsuiteUid,
      }),
    }
  } catch (catchError) {
    const errorMessage = `Could not prepare Hootsuite Params for Redux`
    reportError(errorMessage)
    return
  }
}

/**
 *
 * @param {*} store - Redux store
 * @param {*} config - App config with login url
 * @param {*} hootsuiteParamData - Object containing Hootsuite data sent originally from the URL, then converted for use in Redux in app.
 * @returns
 */
export const buildHsStateParam = ({ store, hootsuiteParamData, loginUrl }) => {
  try {
    const params = hsParamsForUrl({ hootsuiteParamData })
    const paramsString = JSON.stringify(params)
    const encodedParams = encodeBase64({ data: paramsString })
    const fullUrl = `${loginUrl}&state=${encodedParams}`
    return fullUrl
  } catch (catchError) {
    const errorMessage = `Could not build Redirect URL`
    reportError(errorMessage, catchError)
  }
}

/**
 *
 * @param {*} store - Redux store
 * @returns state object
 */
export const getParamsFromState = ({ store }) => {
  try {
    const encodedStateParam = getParameterByName({ store, name: 'state' })
    const decodedStateString = decodeBase64({ data: encodedStateParam })
    const state = JSON.parse(decodedStateString)
    return state
  } catch (catchError) {
    const errorMessage = `Could not get encoded parameters from url state param`
    reportError(errorMessage, catchError)
  }
}

/**
 *
 * @param {*} store - Redux store
 * @param {*} config - App config with login url
 * @param {*} hootsuiteParamData - Object containing Hootsuite data sent originally from the URL, then converted for use in Redux in app.
 * @returns params string. Example: &uid=123&pid=999
 */
export const buildHsParams = ({ store, hootsuiteParamData }) => {
  try {
    const paramsString = Object.keys(hootsuiteParamData)
      .map((key) => key + '=' + hootsuiteParamData[key])
      .join('&')

    return paramsString
  } catch (catchError) {
    const errorMessage = `Could not build params string`
    reportError(errorMessage, catchError)
  }
}

/**
 *
 * @param {*} store - Redux store
 * @returns hootsuiteParamsData object
 */
export const getHsParamDataFromRedux = ({ store }) => {
  try {
    const storeState = store?.getState()
    const hootsuiteParamData = {
      hootsuiteUid: storeState?.hootsuiteUid,
      hootsuitePid: storeState?.hootsuitePid,
      hootsuiteToken: storeState?.hootsuiteToken,
      hootsuiteTimestamp: storeState?.hootsuiteTimestamp,
      hootsuiteLang: storeState?.hootsuiteLang,
      hootsuiteTimezone: storeState?.hootsuiteTimezone,
      source: storeState?.source,
      namespace: storeState?.namespace,
      ...(storeState.ispro && { ispro: storeState.ispro }),
    }
    return hootsuiteParamData
  } catch (catchError) {
    const errorMessage = `Could not get Hootsuite Param Data from Redux Store`
    reportError(errorMessage, catchError)
  }
}
