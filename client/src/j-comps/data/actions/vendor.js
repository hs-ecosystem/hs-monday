import { reportError } from '../../utils/index'
import { store } from '../../..'

export const setMappedFields = async ({ fields }) => {
  try {
    store.dispatch({ type: `SET_MAPPED_FIELDS`, fields })
  } catch (error) {
    const errorMessage = `Could not set mapped fields`
    return reportError(errorMessage, error)
  }
}
