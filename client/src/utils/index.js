import { store } from '..'
import { setItems, reportError, postItems, theme } from '../j-comps'
import {
  checkHootsuiteAccessToken,
  checkMondayAccessToken,
} from '../j-comps/data/actions/account'
import { getParameterByName } from './vendor'
import camelcase from 'camelcase'
import {
  MONDAY_FIELD_NAMES_AND_TYPES,
  FIELD_TYPES_AND_ICON_NAME,
} from '../constants'
import TwitterIcon from '../__App__/Dashboard/DashboardBody/FieldMapper/SocialProfilePicker/ProfilesList/SocialNetworkIcons/tw-icon.png'
import FacebookIcon from '../__App__/Dashboard/DashboardBody/FieldMapper/SocialProfilePicker/ProfilesList/SocialNetworkIcons/fb-icon.png'
import ThreadsIcon from '../__App__/Dashboard/DashboardBody/FieldMapper/SocialProfilePicker/ProfilesList/SocialNetworkIcons/th-icon.png'
import InstagramIcon from '../__App__/Dashboard/DashboardBody/FieldMapper/SocialProfilePicker/ProfilesList/SocialNetworkIcons/ig-icon.png'
import LinkedInIcon from '../__App__/Dashboard/DashboardBody/FieldMapper/SocialProfilePicker/ProfilesList/SocialNetworkIcons/li-icon.png'

const getHootsuiteTokenFromRefresh = async ({
  monday,
  mondayId,
  hootsuiteUid,
  rt,
}) => {
  try {
    const newTokenRes = await postItems({
      monday,
      namespace: 'hootsuite',
      resource: 'oauth/token',
      action: 'refresh',
      bodyData: { rt },
    })
    const { data } = newTokenRes
    if (data && data.access_token) {
      const res = await postItems({
        monday,
        namespace: 'hootsuite',
        resource: 'access-token',
        action: 'update',
        bodyData: {
          mondayId,
          hootsuiteUid,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        },
      })
      return { data: res.data, ok: true }
    }
    return { error: true }
  } catch (catchError) {
    const errorMessage = `Could not get token from refresh token`
    reportError(errorMessage, catchError)
  }
}

export const checkHootsuiteOauth = async ({
  monday,
  navigate,
  startFunction,
  mondayData,
  hootsuiteUid,
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
    const { data } = res
    const { at, rt } = data

    if (at) {
      const response = await checkHootsuiteAccessToken({
        monday,
        at,
        tokenName: 'hootsuite',
      })

      if (response.ok) {
        setItems({ resource: 'isHootsuiteAuthed', items: true })
        startFunction({ monday, mondayData, at, hootsuiteUid, mondayId })
      } else {
        const refreshRes = await getHootsuiteTokenFromRefresh({
          monday,
          mondayId,
          hootsuiteUid,
          rt,
        })

        if (!refreshRes.ok) {
          postItems({
            monday,
            namespace: 'hootsuite',
            resource: 'access-token',
            action: 'delete',
            bodyData: { mondayId },
          })
            .then(() => {
              navigate(`/hootsuite-login`)
            })
            .catch((catchError) => {
              const errorMessage = `Could not delete hootsuite access token`
              reportError(errorMessage, catchError, true)
            })
        } else {
          setItems({ resource: 'isHootsuiteAuthed', items: true })
          startFunction({ monday, mondayData, at, hootsuiteUid, mondayId })
        }
      }
    } else {
      navigate(`/hootsuite-login`)
    }
  } catch (catchError) {
    const errorMessage = `Could not check hootsuite oauth`
    reportError(errorMessage, catchError)
  }
}

export const checkMondayOauth = async ({
  monday,
  navigate,
  startFunction,
  mondayData,
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

    const { data } = res
    const { at } = data

    if (at) {
      const response = await checkMondayAccessToken({
        monday,
        at,
        tokenName: 'monday',
      })
      if (response.ok) {
        setItems({ resource: 'isMondayAuthed', items: true })
        startFunction({ monday, hootsuiteUid, mondayData, mondayId })
      } else {
        postItems({
          monday,
          namespace: 'hootsuite',
          resource: 'access-token',
          action: 'delete',
          bodyData: { hootsuiteUid },
        })
          .then(() => {
            navigate(`/monday-login`)
          })
          .catch((catchError) => {
            const errorMessage = `Could not delete Monday access token`
            reportError(errorMessage, catchError, true)
          })
      }
    } else {
      navigate(`/monday-login`)
    }
  } catch (catchError) {
    const errorMessage = `Could not check Monday oauth`
    reportError(errorMessage, catchError)
  }
}

export const setView = () => {
  const paramSource = getParameterByName('source')
  const maybeSource = paramSource ? paramSource : 'stream'
  setItems({ store, resource: 'source', items: maybeSource })
}

export const setMemberId = () => {
  const paramMemberId = getParameterByName('uid')
  const items = paramMemberId ? paramMemberId : undefined
  setItems({ store, resource: 'memberId', items })
}

export const downloadImg = async (url) => {
  try {
    const response = await fetch(url)
    const buffer = await response.buffer()
    return buffer
  } catch (catchError) {
    const errorMessage = `Could not download Image.`
    reportError(errorMessage, catchError)
  }
}

export const getAllowedFieldType = ({ fieldName }) => {
  try {
    const t = MONDAY_FIELD_NAMES_AND_TYPES
    const type = t[fieldName]
    return camelcase(type, { pascalCase: true })
  } catch (catchError) {
    const errorMessage = `Could not get allowed field type`
    reportError(errorMessage, catchError)
  }
}

export const getFieldIcon = ({ fieldName }) => {
  try {
    const fieldType = getAllowedFieldType({ fieldName })
    const i = FIELD_TYPES_AND_ICON_NAME
    const icon = i[fieldType]
    return icon
  } catch (catchError) {
    const errorMessage = `Could not get Field Icon.`
    reportError(errorMessage, catchError)
  }
}

export const getSelectedFieldIcon = ({ fieldName }) => {
  try {
    const fieldType = getAllowedFieldType({ fieldName })
    const i = FIELD_TYPES_AND_ICON_NAME
    const icon = (
      <span style={{ color: theme.color.monday.primary }}>{i[fieldType]}</span>
    )
    return icon
  } catch (catchError) {
    const errorMessage = `Could not get Field Icon.`
    reportError(errorMessage, catchError)
  }
}

export const getNetworkIcon = (network) => {
  try {
    if (
      network === 'FACEBOOKPAGE' ||
      network === 'FACEBOOK' ||
      network === 'FACEBOOKGROUP'
    )
      return FacebookIcon
    if (network === 'TWITTER') return TwitterIcon
    if (network === 'INSTAGRAMBUSINESS') return InstagramIcon
    if (
      network === 'LINKEDIN' ||
      network === 'LINKEDINGROUP' ||
      network === 'LINKEDINCOMPANY'
    )
      return LinkedInIcon
    if (network === 'THREADS') return ThreadsIcon
    return
  } catch (catchError) {
    const errorMessage = `Could not get social network icon`
    reportError(errorMessage, catchError)
  }
}

export const isObject = (obj) => {
  try {
    return Object.prototype.toString.call(obj) === '[object Object]'
  } catch (catchError) {
    const errorMessage = `Could not check if is object`
    reportError(errorMessage, catchError)
    return false
  }
}

export const isFunction = (func) => {
  try {
    return func instanceof Function
  } catch (catchError) {
    const errorMessage = `Could not check is is function`
    reportError(errorMessage, catchError)
  }
}
