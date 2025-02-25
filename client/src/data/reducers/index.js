const initialState = {
  errorMessage: '',
  alertMessage: false,
  dashboardView: 'wizard-guide',
  isLoading: false,
  at: null,
  fields: [],
  socialProfiles: [],
  isLoadingSocialProfiles: true,
  isFieldsLoading: true,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_ERROR':
      return {
        ...state,
        errorMessage: action.action,
      }
    case 'CLEAR_ERROR':
      return {
        errorMessage: '',
        ...state,
      }
    case 'SET_ITEMS':
      return {
        ...state,
        [action.object.resource]: action.object.items,
      }
    case 'SET_MORE_ITEMS':
      return {
        ...state,
        [action.object.resource]: {
          ...action.object.items,
          _content: [
            ...state[action.object.resource]._content,
            ...action.object.items._content,
          ],
        },
      }
    case 'REMOVE_ITEMS':
      delete state[action.resource]
      return {
        ...state,
      }
    case 'SET_STREAM_TAB':
      return {
        ...state,
        dashboardView: action.dashboardView,
      }
    case 'RESET_STATE':
      return state
    case 'SET_MAPPED_FIELDS':
      return {
        ...state,
        selectedDateField: action.fields.selectedDateField,
        selectedChannelField: action.fields.selectedChannelField,
        selectedSocialProfileField: action.fields.selectedSocialProfileField,
        selectedSocialProfileIdField:
          action.fields.selectedSocialProfileIdField,
        selectedMediaField: action.fields.selectedMediaField,
        selectedMediaIdsField: action.fields.selectedMediaIdsField,
        selectedStatusField: action.fields.selectedStatusField,
        selectedSocialPostField: action.fields.selectedSocialPostField,
        selectedTitleField: action.fields.selectedTitleField,
        selectedMessageIdField: action.fields.selectedMessageIdField,
        selectedLastUpdatedField: action.fields.selectedLastUpdatedField,
        selectedScheduleField: action.fields.selectedScheduleField,
        selectedDeleteField: action.fields.selectedDeleteField,
      }
    default:
      return state
  }
}

export default reducer
