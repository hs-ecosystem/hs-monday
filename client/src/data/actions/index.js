import { store } from '../..'
import { reportError, postItems, clearError } from '../../j-comps'

export const getUserSettings = async ({
  monday,
  mondayId,
  hootsuiteUid,
  boardId,
}) => {
  try {
    const { data } = await postItems({
      monday,
      namespace: 'monday',
      resource: 'user-settings',
      action: 'get',
      bodyData: { mondayId, hootsuiteUid, boardId },
    })
    return data
  } catch (catchError) {
    const errorMessage = `Could not get User Settings.`
    reportError(errorMessage, catchError)
  }
}

export const setUserSetting = async ({
  monday,
  mondayId,
  setting,
  boardId,
}) => {
  try {
    const userSettings = await getUserSettings({ monday, mondayId, boardId })
    if (userSettings) {
      const bodyData = {
        mondayId,
        ...userSettings,
        [setting.key]: setting.value,
        boardId,
      }
      const { data } = await postItems({
        monday,
        namespace: 'monday',
        resource: 'user-settings',
        action: 'update',
        bodyData,
      })

      return data
    }
  } catch (catchError) {
    const errorMessage = `Could not set User Settings - ${setting}`
    reportError(errorMessage, catchError)
  }
}

export const createUserSettings = async ({
  monday,
  mondayId,
  hootsuiteUid,
  boardId,
}) => {
  try {
    const bodyData = {
      mondayId,
      hootsuiteUid,
      boardId,
      numMonthsToImport: 1,
    }
    const doesExist = await getUserSettings({
      monday,
      mondayId,
      hootsuiteUid,
      boardId,
    })

    if (!doesExist) {
      await postItems({
        monday,
        namespace: 'monday',
        resource: 'user-settings',
        action: 'create',
        bodyData,
      })

      return
    }
  } catch (catchError) {
    const errorMessage = `Could not create new User settings.`
    reportError(errorMessage, catchError)
  }
}

export const checkForExistingMondayLogin = async ({
  monday,
  mondayId,
  boardId,
}) => {
  try {
    const mondayRes = await postItems({
      monday,
      namespace: 'monday',
      resource: 'access-token',
      action: 'get',
      bodyData: { mondayId },
    })
    const hootsuiteRes = await postItems({
      monday,
      namespace: 'hootsuite',
      resource: 'access-token',
      action: 'get',
      bodyData: { mondayId },
    })
    const userSettingsRes = await postItems({
      monday,
      namespace: 'monday',
      resource: 'user-settings',
      action: 'get',
      bodyData: { mondayId, boardId },
    })

    if (
      mondayRes?.data?.at ||
      hootsuiteRes?.data?.at ||
      userSettingsRes?.data?.fieldMappings
    ) {
      return true
    } else {
      return false
    }
  } catch (catchError) {
    const errorMessage = `Could not check for existing monday.com account logged in.`
    reportError(errorMessage, catchError)
  }
}

// Clear all data in db for that mondayId
export const handleLogoutClick = async ({ monday, mondayId, navigate }) => {
  try {
    postItems({
      monday,
      namespace: 'hootsuite',
      resource: 'access-token',
      action: 'delete',
      bodyData: { mondayId },
    })
      .then(() => {
        postItems({
          monday,
          namespace: 'monday',
          resource: 'access-token',
          action: 'delete',
          bodyData: { mondayId },
        }).then(() => {
          postItems({
            monday,
            namespace: 'monday',
            resource: 'user-settings',
            action: 'delete',
            bodyData: {
              mondayId,
            },
          }).then(() => {
            clearError({ store })
            navigate(`/hootsuite-login`)
          })
        })
      })
      .catch((catchError) => {
        const errorMessage = `Could not delete Hootsuite access token.`
        reportError(errorMessage, catchError, true)
      })
  } catch (catchError) {
    const errorMessage = `Could not logout of Hootsuite and monday.com`
    reportError(errorMessage, catchError)
  }
}
