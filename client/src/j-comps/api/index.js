import axios from 'axios'
import { reportError } from '../utils/index'

export const apiReportError = (errorMessage, error) => {
  return axios.post(`/api/reportError`, { errorMessage, error })
}

const getMondayAuthHeader = async ({ monday }) => {
  try {
    if (monday) {
      const token = await monday.get('sessionToken')
      const axiosHeaders = { headers: { Authorization: token.data } }
      return axiosHeaders
    }
    return
  } catch (catchError) {
    const errorMessage = `Could not get monday auth header`
    reportError(errorMessage, catchError)
  }
}

const checkMondayJwtToken = async ({ monday, data }) => {
  try {
    if (data.error) {
      const errorMessage = `monday.com JWT error`
      reportError(errorMessage, JSON.stringify(data))
      monday.execute('notice', {
        message: 'Session expired.  Please refresh page.',
        type: 'error',
      })
    }
  } catch (catchError) {
    const errorMessage = `Could not check monday.com JWT Token.`
    reportError(errorMessage, catchError)
  }
}

export const apiCheckHootsuiteAccessToken = async ({ monday, at }) => {
  try {
    const url = '/api/hootsuite/check-access-token'
    const axiosHeaders = await getMondayAuthHeader({ monday })
    const { data } = await axios.post(url, { at }, axiosHeaders)
    return data
  } catch (catchError) {
    const errorMessage = `Could not check Hootsuite API Access Token`
    reportError(errorMessage, catchError)
    return false
  }
}

export const apiCheckMondayAccessToken = async ({ monday, at }) => {
  try {
    const url = '/api/monday/check-access-token'
    const axiosHeaders = await getMondayAuthHeader({ monday })
    const { data } = await axios.post(url, { at }, axiosHeaders)
    return data
  } catch (catchError) {
    const errorMessage = `Could not check Monday API Access Token`
    reportError(errorMessage, catchError)
    return false
  }
}

export const apiGetItems = async ({
  monday,
  namespace,
  resource,
  bodyData,
}) => {
  try {
    const axiosHeaders = await getMondayAuthHeader({ monday })
    const { data } = await axios.post(
      `/api/${namespace}/${resource}`,
      { resource, ...bodyData },
      axiosHeaders
    )
    checkMondayJwtToken({ monday, data })
    return data
  } catch (error) {
    const errorMessage = `Could not get ${namespace} item: ${resource}`
    reportError(errorMessage, error)
    return
  }
}

export const apiPostItems = async ({
  monday,
  namespace,
  resource,
  action,
  bodyData,
}) => {
  try {
    const url = `/api/${namespace}/${resource}/${action}`
    const axiosHeaders = await getMondayAuthHeader({ monday })
    const data = await axios.post(url, { ...bodyData }, axiosHeaders)
    checkMondayJwtToken({ monday, data })
    return data
  } catch (error) {
    const errorMessage = `Could not post ${namespace} ${resource}`
    reportError(errorMessage, error)
    return
  }
}
