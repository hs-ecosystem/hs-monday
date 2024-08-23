import { reportError } from './index'
import { postItems } from '../data/actions/items'

export const loadState = ({ name, allowNull }) => {
  try {
    const serializedState = localStorage.getItem(name)
    if (serializedState === null) {
      const errorMessage = `Could not retrieve "${name}" from local storage`
      if (!allowNull) reportError(errorMessage)
      return undefined
    } else {
      return JSON.parse(serializedState)
    }
  } catch (error) {
    const errorMessage = `Could not retrieve "${name}" from local storage`
    reportError(errorMessage)
    return undefined
  }
}

export const saveState = ({ name, data }) => {
  try {
    const maybeSerializedState =
      typeof data === 'string' ? data : JSON.stringify(data)
    localStorage.setItem(name, maybeSerializedState)
  } catch (error) {
    const errorMessage = `Could not save "${name}" into local storage`
    reportError(errorMessage)
  }
}

export const removeState = ({ name }) => {
  try {
    localStorage.removeItem(name)
  } catch (error) {
    const errorMessage = `Could not remove "${name}" from local storage`
    reportError(errorMessage)
  }
}

export const loadUserSettings = ({ store, app }) => {
  const userSettings = loadState({
    store,
    name: `${app}_user_settings`,
    allowNull: true,
  })
  return userSettings
}

/**
 * Check to see if Access Token exists in LocalStorage.  If it does exist, push to "/" route.  If not, return and do nothing.
 *
 */
export const checkStorageForTokens = ({ history, tokenName }) => {
  const t = tokenName === 'monday' ? `monday_hootsuite` : `hootsuite_monday`
  const maybeStorageAt = localStorage.call(`${t}_access_token`)

  if (maybeStorageAt) {
    history.push({ pathname: '/' })
  }
  return
}

export const checkHootsuiteDbForTokens = async ({
  monday,
  navigate,
  mondayId,
}) => {
  try {
    const res = await postItems({
      monday,
      namespace: 'hootsuite',
      resource: 'access-token',
      action: 'get',
      bodyData: { mondayId },
    })
    if (res.data && res.data !== '' && res.data.at) {
      navigate('/')
    }
    return
  } catch (catchError) {
    const errorMessage = `Could not check Hootsuite db for tokens.`
    reportError(errorMessage, catchError)
  }
}

export const checkMondayDbForTokens = async ({
  monday,
  history,
  hootsuiteUid,
  mondayId,
}) => {
  try {
    const res = await postItems({
      monday,
      namespace: 'monday',
      resource: 'access-token',
      action: 'get',
      bodyData: { hootsuiteUid, mondayId },
    })
    if (res.data && res.data !== '' && res.data.at) {
      history.push({ pathname: '/' })
    }
    return
  } catch (catchError) {
    const errorMessage = `Could not check Monday db for tokens.`
    reportError(errorMessage, catchError)
  }
}
