import axios from 'axios'
import { store } from '../..'
import { Buffer } from 'buffer'

export const escapeQuotes = (message) => {
  return message.replace(/"/g, "'").replace(/’/g, "'")
}

export const reportError = (
  errorMessage,
  error = '',
  noDispatch = false,
  consoleOutError = false
) => {
  if (process.env.NODE_ENV === 'production') {
    console.log(errorMessage, error)
    return axios.post(`/api/reportError`, { errorMessage, error })
  }
  if (!noDispatch) {
    try {
      return store.dispatch({ type: 'SET_ERROR', action: errorMessage })
    } catch (error) {
      console.log('Could not report error')
    }
  }
  if (consoleOutError) {
    console.log(errorMessage, error)
  }
}

export const checkBrowserPermissions = () => {
  try {
    localStorage.setItem('test', true)
    localStorage.removeItem('test')
  } catch (error) {
    const errorMessage = 'Error - Third-party script cookies are disallowed'
    reportError(errorMessage, error)
  }
}

export const isEmptyObject = (data) => {
  try {
    return Object.entries(data).length === 0 && data.constructor === Object
  } catch (error) {
    const errorMessage = 'Error - Could not check if is empty object'
    reportError(errorMessage, error)
  }
}

export const getParameterByName = ({ name }) => {
  try {
    const params = new URLSearchParams(window.location.search)
    return params.get(name)
  } catch (catchError) {
    const errorMessage = `Could not get parameter by name`
    reportError(errorMessage, catchError)
  }
}

export const encodeBase64 = ({ data }) => {
  try {
    return Buffer.from(data).toString('base64')
  } catch (catchError) {
    const errorMessage = `Could not encodeBase64`
    reportError(errorMessage, catchError)
  }
}

export const decodeBase64 = ({ data }) => {
  try {
    return window.atob(data)
  } catch (catchError) {
    const errorMessage = `Could not decodeBase64`
    reportError(errorMessage, catchError)
  }
}
