import { reportError } from '../../utils/index'
import { apiGetItems, apiPostItems } from '../../api/index'
import { store } from '../../..'

export const getItems = async ({
  monday,
  namespace,
  resource,
  bodyData = null,
  moreData = false,
}) => {
  try {
    const items = await apiGetItems({
      monday,
      namespace,
      resource,
      bodyData,
    })

    if (moreData) {
      // Handle pagination call.  Add to the items in store.
      store.dispatch({
        type: `SET_MORE_ITEMS`,
        object: { resource, items, existingItems: bodyData.existingItems },
      })
    } else {
      // Override items in store.
      store.dispatch({
        type: `SET_ITEMS`,
        object: { resource, items },
      })
      return items
    }
  } catch (error) {
    const errorMessage = `Could not get ${namespace} ${resource}`
    return reportError(errorMessage, error)
  }
}

export const setItems = async ({ resource, items }) => {
  try {
    store.dispatch({
      type: `SET_ITEMS`,
      object: { resource, items },
    })
  } catch (error) {
    const errorMessage = `Could not set ${resource}`
    return reportError(errorMessage, error)
  }
}

export const postItems = async ({
  monday,
  namespace,
  resource,
  action,
  bodyData,
}) => {
  try {
    const result = await apiPostItems({
      monday,
      namespace,
      resource,
      action,
      bodyData,
    })

    if (result.hasError) {
      // This isn't real

      const errorMessage = `Could not post to ${namespace} ${resource}`
      return reportError(errorMessage)
    } else {
      return result
    }
  } catch (error) {
    const errorMessage = `Could not post ${namespace} ${resource}`
    return reportError(errorMessage, error)
  }
}

export const removeItems = async ({ resource }) => {
  try {
    store.dispatch({
      type: `REMOVE_ITEMS`,
      resource,
    })
  } catch (error) {
    const errorMessage = `Could not remove ${resource}`
    return reportError(errorMessage, error)
  }
}
