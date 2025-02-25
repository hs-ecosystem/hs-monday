import config from '../../../config'
import {
  apiCheckHootsuiteAccessToken,
  apiCheckMondayAccessToken,
} from '../../api/index'

/**
 *  Check either the Oauth Access Token or API Key.
 *  The function should call "/me" route and should return "ok: true" using a reducer.
 *
 *  Reqires:
 *    - "/check-access-token" server route similar to "/me"
 *    - return "ok: true" using reducer
 */

export const checkHootsuiteAccessToken = async ({ monday, at, tokenName }) => {
  try {
    const response = await apiCheckHootsuiteAccessToken({
      monday,
      app: config.app,
      at,
      tokenName,
    })
    return response
  } catch (error) {
    return error
  }
}

export const checkMondayAccessToken = async ({ monday, at, tokenName }) => {
  try {
    const response = await apiCheckMondayAccessToken({
      monday,
      app: config.app,
      at,
      tokenName,
    })
    return response
  } catch (error) {
    return error
  }
}
