import { store } from '../../..'
import { reportError } from '../../utils/index'

export const resetState = () => {
  try {
    return store.dispatch({ type: 'RESET_STATE' })
  } catch (error) {
    const errorMessage = 'Could not reset state'
    return reportError(errorMessage, error)
  }
}

export const setError = ({ message }) => {
  try {
    return store.dispatch({ type: 'SET_ERROR', action: message })
  } catch (error) {
    const errorMessage = 'Could not set error'
    return reportError(errorMessage, error)
  }
}

export const clearError = ({ store }) => {
  try {
    return store.dispatch({ type: 'SET_ERROR', action: '' })
  } catch (error) {
    const errorMessage = 'Could not clear error'
    return reportError(errorMessage, error)
  }
}

export const setDashboardView = ({ dashboardView }) => {
  try {
    return store.dispatch({ type: 'SET_STREAM_TAB', dashboardView })
  } catch (error) {
    const errorMessage = 'Could not set Stream Tab'
    return reportError(errorMessage, error)
  }
}
