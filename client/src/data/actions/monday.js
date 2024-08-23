import { reportError, postItems, setItems } from '../../j-comps'
import { store } from '../..'
import { getScheduledMessages } from './hootsuite'
import { getUserSettings, setUserSetting } from '.'
import { parseISO } from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'
import { MONDAY_FIELD_NAMES_AND_TYPES } from '../../constants'
import { setMappedFields } from '../../j-comps/data/actions/vendor'
import { isFunction, isObject } from '../../utils'

//////////////////////////////////
// Monday SDK
//////////////////////////////////
export const getHootsuiteUid = async ({ monday, mondayId, navigate }) => {
  try {
    const { data } = await postItems({
      monday,
      namespace: 'hootsuite',
      resource: 'access-token',
      action: 'get',
      bodyData: { mondayId },
    })
    const hootsuiteUid = data.hootsuiteUid
    if (hootsuiteUid) {
      setItems({ resource: 'hootsuiteUid', items: hootsuiteUid })
      return hootsuiteUid
    } else {
      navigate(`/hootsuite-login`)
    }
  } catch (catchError) {
    const errorMessage = `Could not get Hootsuite UID`
    reportError(errorMessage, catchError)
  }
}

export const getMondayBoard = async ({
  monday,
  mondayData,
  hootsuiteUid,
  mondayId,
}) => {
  try {
    const userSettings = await getUserSettings({
      monday,
      mondayId,
      hootsuiteUid,
      boardId: mondayData.boardId,
    })
    setUserSetting({
      monday,
      mondayId,
      hootsuiteUid,
      setting: { key: 'boardId', value: mondayData.boardId },
      boardId: mondayData.boardId,
    })
    const boardId = mondayData.boardId || userSettings.boardId
    const query = `query { boards(ids: [${boardId}]) {  id, name } }`
    const boardsRes = await monday.api(query)
    const boards = boardsRes.data.boards
    const board = boards.map((b) => ({ ...b, text: b.name }))[0]
    setItems({ store, resource: 'board', items: board })
    setItems({ store, resource: 'boardId', items: board.id })
    return board
  } catch (catchError) {
    const errorMessage = `Could not get Monday Board.`
    const errorString = isFunction(catchError)
      ? catchError.toString
      : isObject(catchError)
      ? JSON.stringify(catchError)
      : catchError
    reportError(errorMessage, {
      mondayData,
      hootsuiteUid,
      mondayId,
      catchError: errorString,
    })
  }
}

export const getMondayGroups = ({ monday, boardId }) => {
  try {
    const query = `query { boards(ids: [${boardId}]) { groups { id, title, color } } }`
    monday.api(query).then((res) => {
      const groups = res.data.boards[0].groups
      const items = groups.map((g) => ({ ...g, text: g.title }))
      setItems({ store, resource: 'groups', items })
    })
  } catch (catchError) {
    const errorMessage = `Could not get Monday Groups.`
    reportError(errorMessage, catchError)
  }
}

export const getMondayColumns = ({ monday, boardId }) => {
  try {
    const query = `query { boards(ids: [${boardId}]) { columns { id, title, type } } }`
    monday.api(query).then((res) => {
      const columns = res.data.boards[0].columns
      setItems({ store, resource: 'columns', items: columns })
    })
  } catch (catchError) {
    const errorMessage = `Could not get Monday Columns.`
    reportError(errorMessage, catchError)
  }
}

export const getMondayItems = (monday, boardId) => {
  try {
    const query = `query { boards(ids: [${boardId}]) { items_page { items { id, column_values { id, type, text, value } } } } }`
    return monday.api(query).then((res) => {
      const items = res.data.boards[0].items
      return items
    })
  } catch (catchError) {
    const errorMessage = `Could not get Monday Items.`
    reportError(errorMessage, catchError)
  }
}

export const getSavedFields = async ({
  monday,
  mondayId,
  hootsuiteUid,
  boardId,
  source,
}) => {
  try {
    const { data } = await postItems({
      monday,
      namespace: 'monday',
      resource: 'user-settings',
      action: 'get',
      bodyData: { mondayId, hootsuiteUid, boardId, getSaveFields: 'true' },
    })
    return data.fieldMappings
  } catch (catchError) {
    console.log(`Source of who called getSavedFields:  ${boardId}, ${source}`)
    const errorMessage = `Could not get Saved Monday Fields.`
    reportError(errorMessage, catchError)
  }
}

export const clearAllSavedFields = async ({
  monday,
  mondayId,
  hootsuiteUid,
  boardId,
}) => {
  try {
    setItems({ resource: 'fromClearFields', items: true })
    const bodyData = { mondayId, boardId }
    const updateRes = await postItems({
      monday,
      namespace: 'monday',
      resource: 'user-settings',
      action: 'remove-field-mappings',
      bodyData,
    })

    getMondayColumns({ monday, boardId })

    return updateRes.data
  } catch (catchError) {
    const errorMessage = `Could not clear all Saved Monday Fields.`
    reportError(errorMessage, catchError)
  }
}

export const setSavedField = async ({
  monday,
  mondayId,
  hootsuiteUid,
  fieldName,
  fieldValue,
  boardId,
  groupId,
}) => {
  try {
    const existingMappings = await getSavedFields({
      monday,
      mondayId,
      hootsuiteUid,
      boardId,
      groupId,
      source: 'setSavedField',
    })
    if (existingMappings) {
      const fieldMappings = existingMappings
        ? { ...existingMappings, [fieldName]: fieldValue }
        : { [fieldName]: fieldValue }
      setUserSetting({
        monday,
        mondayId,
        setting: { key: 'fieldMappings', value: fieldMappings },
        boardId,
      })
    } else {
      const fieldMappings = { [fieldName]: fieldValue }
      setUserSetting({
        monday,
        mondayId,
        setting: { key: 'fieldMappings', value: fieldMappings },
        boardId,
      })
    }
  } catch (catchError) {
    const errorMessage = `Could not set Saved Monday Field.`
    reportError(errorMessage, catchError)
  }
}

export const removeSavedField = async ({
  monday,
  mondayId,
  hootsuiteUid,
  fieldName,
  boardId,
}) => {
  try {
    const existingMappings = await getSavedFields({
      monday,
      mondayId,
      hootsuiteUid,
      boardId,
      source: 'removeSavedField',
    })
    delete existingMappings[fieldName]
    return await setUserSetting({
      monday,
      mondayId,
      setting: { key: 'fieldMappings', value: existingMappings },
      boardId,
    })
  } catch (catchError) {
    const errorMessage = `Could not remove Saved Monday Field.`
    reportError(errorMessage, catchError)
  }
}

export const loadSavedFields = async ({
  monday,
  mondayId,
  hootsuiteUid,
  boardId,
}) => {
  try {
    const savedFields = await getSavedFields({
      monday,
      mondayId,
      hootsuiteUid,
      boardId,
      source: 'loadSavedField',
    })
    if (savedFields) {
      Object.entries(savedFields).map(([key, value]) => {
        setItems({ store, resource: key, items: value })
        return setItems({ resource: 'isFieldsLoading', items: false })
      })
    } else {
      return setItems({ resource: 'isFieldsLoading', items: false })
    }
    return savedFields
  } catch (catchError) {
    const errorMessage = `Could not load Saved Monday Fields.`
    reportError(errorMessage, catchError)
  }
}

const prepareScheduledMessage = ({ hootsuiteMessage, mondayFields }) => {
  try {
    const {
      selectedDateField,
      selectedChannelField,
      selectedSocialProfileField,
      selectedSocialProfileIdField,
      selectedStatusField,
      selectedSocialPostField,
      selectedMessageIdField,
      selectedMediaIdsField,
    } = mondayFields

    const socialProfileName =
      hootsuiteMessage?.profile?.socialNetworkUsername &&
      hootsuiteMessage.profile.socialNetworkUsername !== null
        ? hootsuiteMessage.profile.socialNetworkUsername
        : `Twitter ID: ${hootsuiteMessage?.profile?.id}`

    const socialProfileId = hootsuiteMessage.profile.id

    const socialNetwork = hootsuiteMessage?.profile?.type
      ? hootsuiteMessage.profile.type
      : `Unknown Network`

    const formatInTimeZone = (date, fmt, tz) =>
      format(utcToZonedTime(date, tz), fmt, { timeZone: tz })

    const hsDate = formatInTimeZone(
      parseISO(hootsuiteMessage.scheduledSendTime),
      'yyyy-MM-dd',
      'UTC'
    )

    const hsTime = formatInTimeZone(
      parseISO(hootsuiteMessage.scheduledSendTime),
      'HH:mm:ss',
      'UTC'
    )

    const hsMediaIds = hootsuiteMessage?.media
      ? hootsuiteMessage.media.map((m) => m.id)
      : ['']
    const hsMediaIdsString = hsMediaIds.toString()

    const allColumnData = {
      [selectedDateField.id]: { date: hsDate, time: hsTime },
      [selectedChannelField.id]: socialNetwork,
      [selectedSocialProfileField.id]: socialProfileName,
      [selectedSocialProfileIdField.id]: socialProfileId,
      [selectedStatusField.id]: hootsuiteMessage.state,
      [selectedSocialPostField.id]: hootsuiteMessage.text,
      [selectedMessageIdField.id]: hootsuiteMessage.id,
      [selectedMediaIdsField.id]: hsMediaIdsString,
    }

    return JSON.stringify(allColumnData)
  } catch (catchError) {
    const errorMessage = `Could not Prepare Scheduled Message.`
    reportError(errorMessage, catchError)
  }
}

const findExistingMondayItems = async ({
  monday,
  hootsuiteMessages,
  boardId,
  selectedMessageIdField,
}) => {
  try {
    if (hootsuiteMessages && hootsuiteMessages.length) {
      const messageIdColumnId = selectedMessageIdField.id
      const mondayItems = await getMondayItems(monday, boardId)
      const newItems = mondayItems.filter((m) => {
        const mItem = m.column_values.find((v) => v.id === messageIdColumnId)
        const foundItem = hootsuiteMessages.find((h) => h.id === mItem.text)
        return foundItem
      })
      return newItems
    } else {
      return []
    }
  } catch (catchError) {
    const errorMessage = `Could not update existing Monday Items.`
    reportError(errorMessage, catchError)
  }
}

const filterExistingHootsuiteItems = async ({
  monday,
  hootsuiteMessages,
  boardId,
  selectedMessageIdField,
}) => {
  try {
    if (hootsuiteMessages && hootsuiteMessages.length) {
      const mondayItems = await getMondayItems(monday, boardId)
      const newMessages = hootsuiteMessages.filter((m) => {
        const messageIdColumnId = selectedMessageIdField.id
        const a = mondayItems.find(
          (c) =>
            c.column_values.find((v) => v.id === messageIdColumnId)?.text ===
            m.id
        )
        const mondayId = a?.column_values
          .map((col) => (col.id === 'text1' ? col.text : undefined))
          .filter((e) => e)
        return mondayId?.[0] !== m.id
      })
      return newMessages
    } else {
      return []
    }
  } catch (catchError) {
    const errorMessage = `Could not Filter Existing Monday Items.`
    reportError(errorMessage, catchError)
  }
}

// const attachWebhook = async ({ oldMessage, mondayId, boardId, itemId }) => {
//   try {
//     const webhookMessageRes = await postItems({
//       namespace: 'hootsuite',
//       resource: 'webhook',
//       action: 'attach',
//       bodyData: { oldMessage, mondayId, boardId, itemId },
//     })
//     return webhookMessageRes.data
//   } catch (catchError) {
//     const errorMessage = `Could not attach webhook to Hootsuite message`
//     reportError(store, errorMessage, catchError)
//   }
// }

const addFilesToColumn = async ({
  monday,
  hootsuiteUid,
  mondayId,
  hootsuiteMessage,
  itemId,
  boardId,
}) => {
  try {
    if (hootsuiteMessage.mediaUrls) {
      const filesPromises = hootsuiteMessage.mediaUrls.map((m) => {
        return postItems({
          monday,
          namespace: 'monday',
          resource: 'files',
          action: 'add',
          bodyData: {
            hootsuiteUid,
            mondayId,
            mediaUrl: m.url,
            itemId,
            boardId,
          },
        }).then((fileAddData) => {
          return { ...fileAddData, itemId, ok: true }
        })
      })
      const filesRes = await Promise.all(filesPromises)
      return filesRes
    } else {
      return { itemId }
    }
  } catch (catchError) {
    const errorMessage = `Could not add file to Monday column.`
    reportError(errorMessage, catchError)
    return { itemId }
  }
}

const createMondayTasks = async ({
  monday,
  hootsuiteUid,
  mondayId,
  hootsuiteMessages,
  mondayFields,
  boardId,
  groupId,
}) => {
  try {
    if (hootsuiteMessages && hootsuiteMessages.length) {
      const messagesPromises = hootsuiteMessages.map(
        async (hootsuiteMessage) => {
          const columnData = prepareScheduledMessage({
            hootsuiteMessage,
            mondayFields,
          })
          const colVals = JSON.stringify(columnData)
          const itemName = 'Scheduled Post'

          const createMutation = `mutation { create_item (board_id: ${boardId}, group_id: ${groupId}, item_name: "${itemName}", column_values: ${colVals}, create_labels_if_missing: true) { id } }`

          return (
            monday
              .api(createMutation)
              .then(async (createData) => {
                const itemId = createData.data.create_item.id
                await addFilesToColumn({
                  monday,
                  hootsuiteUid,
                  mondayId,
                  hootsuiteMessage,
                  itemId,
                  boardId,
                })

                return { itemId, ok: true }
              })
              // .then(async (fileCreateData) => {
              //   const attachedWebhookRes = await attachWebhook({
              //     oldMessage: hootsuiteMessage,
              //     mondayId,
              //     boardId,
              //     itemId: fileCreateData.itemId,
              //   })
              //   return attachedWebhookRes
              // })
              .catch((catchError) => {
                const errorMessage = `Could not import Hootsuite Messages.`
                monday.execute('notice', {
                  message: errorMessage,
                  type: 'error',
                  timeout: 5000,
                })
                reportError(errorMessage, catchError)
              })
          )
        }
      )

      return await Promise.all(messagesPromises).then(() => {
        monday.execute('notice', {
          message: `Found ${hootsuiteMessages.length} Hootsuite Posts.`,
          type: 'success',
          timeout: 5000,
        })
      })
    } else {
      monday.execute('notice', {
        message: `Found ${hootsuiteMessages.length} Hootsuite Posts.`,
        type: 'info',
        timeout: 5000,
      })
    }
  } catch (catchError) {
    const errorMessage = `Could not Create Monday Task.`
    reportError(errorMessage, catchError)
  }
}
//////////////////////////////////
// Possibly can remove
//////////////////////////////////
export const syncScheduledMessages = async ({
  monday,
  mondayId,
  mondayFields,
  hootsuiteUid,
  numMonths,
  selectedMessageIdField,
  boardId,
}) => {
  try {
    const userSettings = await getUserSettings({
      monday,
      mondayId,
      hootsuiteUid,
      boardId,
    })
    const messages = await getScheduledMessages({ mondayId, numMonths })

    const mondayItems = await findExistingMondayItems({
      monday,
      hootsuiteMessages: messages,
      boardId: userSettings.boardId,
      selectedMessageIdField,
    })

    await deleteMondayItems({ monday, mondayItems })

    const newHootsuiteMessages = await filterExistingHootsuiteItems({
      monday,
      hootsuiteMessages: messages,
      boardId: userSettings.boardId,
      selectedMessageIdField,
    })

    await createMondayTasks({
      hootsuiteUid,
      mondayId,
      monday,
      hootsuiteMessages: newHootsuiteMessages,
      mondayFields,
      boardId: userSettings.boardId,
      groupId: userSettings.groupId,
    })
    setItems({ resource: 'isLoading', items: false })
  } catch (catchError) {
    setItems({ resource: 'isLoading', items: false })
    const errorMessage = `Could not Sync Scheduled Messages`
    reportError(errorMessage, catchError)
  }
}

export const importScheduledMessages = async ({
  monday,
  mondayId,
  hootsuiteUid,
  mondayFields,
  numMonths,
  selectedMessageIdField,
  boardId,
}) => {
  try {
    const userSettings = await getUserSettings({
      monday,
      mondayId,
      hootsuiteUid,
      boardId,
    })
    const messages = await getScheduledMessages({ mondayId, numMonths })
    const hootsuiteMessages = await filterExistingHootsuiteItems({
      monday,
      hootsuiteMessages: messages,
      boardId: userSettings.boardId,
      selectedMessageIdField,
    })

    await createMondayTasks({
      hootsuiteUid,
      mondayId,
      monday,
      hootsuiteMessages,
      mondayFields,
      boardId: userSettings.boardId,
      groupId: userSettings.groupId,
    })
    setItems({ resource: 'isLoading', items: false })
  } catch (catchError) {
    setItems({ resource: 'isLoading', items: false })
    const errorMessage = `Could not get Hootsuite Scheduled Messages.`
    reportError(errorMessage, catchError)
  }
}

const getMondayGroupItems = async ({ monday, boardId, groupId }) => {
  try {
    const groupsQuery = `query { boards (ids: ${boardId}) { groups (ids: [${groupId}]) { id, items { id } } } }`
    const groupItems = await monday.api(groupsQuery).then((res) => {
      return res.data.boards[0].groups[0].items
    })
    return groupItems
  } catch (catchError) {
    const errorMessage = `Could not get Monday Group Items.`
    reportError(errorMessage, catchError)
  }
}

const deleteMondayItems = async ({ monday, mondayItems }) => {
  try {
    const deletePromises = mondayItems.map(async (item) => {
      const deleteQuery = `mutation { delete_item (item_id: ${item.id}) { id } }`
      return await monday.api(deleteQuery).then((res) => {
        return res
      })
    })

    return await Promise.all(deletePromises)
  } catch (catchError) {
    const errorMessage = `Could not delete Monday Items.`
    reportError(errorMessage, catchError)
  }
}

export const removeAllMondayItemsAndImport = async ({
  monday,
  mondayId,
  hootsuiteUid,
  mondayFields,
  numMonths,
  selectedMessageIdField,
  boardId,
}) => {
  try {
    const userSettings = await getUserSettings({
      monday,
      mondayId,
      hootsuiteUid,
      boardId,
    })
    const { groupId } = userSettings
    const groupItems = await getMondayGroupItems({ monday, boardId, groupId })

    if (groupItems && groupItems.length) {
      await deleteMondayItems({ monday, mondayItems: groupItems })

      importScheduledMessages({
        mondayId,
        hootsuiteUid,
        monday,
        mondayFields,
        numMonths,
        selectedMessageIdField,
        boardId,
      })
    } else {
      importScheduledMessages({
        mondayId,
        hootsuiteUid,
        monday,
        mondayFields,
        numMonths,
        selectedMessageIdField,
        boardId,
      })
    }
  } catch (catchError) {
    const errorMessage = `Could not remove all Monday Items from Group and Import Messages.`
    reportError(errorMessage, catchError)
  }
}

export const removeAllMondayItems = async ({
  monday,
  mondayId,
  hootsuiteUid,
  boardId,
}) => {
  try {
    const userSettings = await getUserSettings({
      monday,
      mondayId,
      hootsuiteUid,
      boardId,
    })
    const { groupId } = userSettings
    const groupItems = await getMondayGroupItems({ monday, boardId, groupId })

    if (groupItems && groupItems.length) {
      await deleteMondayItems({ monday, mondayItems: groupItems })
    }
    monday.execute('notice', {
      message: `Deleted ${groupItems.length} item${
        groupItems.length > 1 ? 's' : ''
      }.`,
      type: 'success',
      timeout: 3000,
    })
  } catch (catchError) {
    const errorMessage = `Could not remove all Monday Items from Group.`
    reportError(errorMessage, catchError)
  }
}

export const createMondayItem = async ({
  monday,
  hootsuiteUid,
  mondayId,
  boardId,
  groupId,
  hsProfile,
  fields,
}) => {
  try {
    const {
      selectedSocialProfileField,
      selectedSocialProfileIdField,
      selectedStatusField,
      selectedChannelField,
    } = fields

    const itemTitle = 'Scheduled Post'
    const allColumnData = JSON.stringify({
      [selectedSocialProfileField.id]: hsProfile.socialNetworkUsername,
      [selectedSocialProfileIdField.id]: hsProfile.id,
      [selectedChannelField.id]: hsProfile.type,
      [selectedStatusField.id]: 'DRAFT',
    })
    const createRes = await postItems({
      monday,
      namespace: 'monday',
      resource: 'task',
      action: 'create',
      bodyData: {
        hootsuiteUid,
        mondayId,
        boardId,
        groupId,
        itemTitle,
        allColumnData,
      },
    })

    if (createRes.data.ok) {
      const itemId = createRes.data.data.create_item.id
      monday.execute('notice', {
        message: `Created new ${hsProfile.type} draft in monday.com for ${hsProfile.socialNetworkUsername} (${hsProfile.id}).`,
        type: 'success',
        timeout: 3000,
      })
      const query = `query { items(ids: [${itemId}]) {  id, name } }`
      await monday.api(query)
      monday.execute('openItemCard', { itemId })
    } else {
      monday.execute('notice', {
        message: `Could not create new ${hsProfile.type} draft in monday.com for ${hsProfile.socialNetworkUsername} (${hsProfile.id}).`,
        type: 'error',
        timeout: 3000,
      })
    }
  } catch (catchError) {
    console.log('catch errorr rororororor', catchError)
    const errorMessage = `Could not create monday.com Item from Social Profile.`
    reportError(errorMessage, catchError)
  }
}

export const autoMapFields = ({ monday, mondayId, boardId, columns }) => {
  try {
    if (columns?.length) {
      let availableFields = [...columns]
      const fields = {}
      Object.entries(MONDAY_FIELD_NAMES_AND_TYPES).map(
        ([fieldName, fieldType]) => {
          const foundValue = availableFields.find((c) => c.type === fieldType)
          if (foundValue) {
            const remainingFields = availableFields.filter(
              (c) => c.id !== foundValue.id
            )
            availableFields = remainingFields
            fields[fieldName] = foundValue
          }
          return foundValue // not used
        }
      )
      setMappedFields({ fields })
      setUserSetting({
        monday,
        mondayId,
        setting: { key: 'fieldMappings', value: fields },
        boardId,
      })
    }
  } catch (catchError) {
    const errorMessage = `Could not auto map fields`
    reportError(errorMessage, catchError)
  }
}
