import { useEffect, useRef } from 'react'
import { autoMapFields } from '../data/actions/monday'

// Hook
export const useWhyDidYouUpdate = (name, props) => {
  // Get a mutable ref object where we can store props ...
  // ... for comparison next time this hook runs.
  const previousProps = useRef()
  useEffect(() => {
    if (previousProps.current) {
      // Get all keys from previous and current props
      const allKeys = Object.keys({ ...previousProps.current, ...props })
      // Use this object to keep track of changed props
      const changesObj = {}
      // Iterate through keys
      allKeys.forEach((key) => {
        // If previous is different from current
        if (previousProps.current[key] !== props[key]) {
          // Add to changesObj
          changesObj[key] = {
            from: previousProps.current[key],
            to: props[key],
          }
        }
      })
      // If changesObj not empty then output to console
      if (Object.keys(changesObj).length) {
        console.log('[why-did-you-update]', name, changesObj)
      }
    }
    // Finally update previousProps with current props for next hook call
    previousProps.current = props
  })
}

// Hook
export const useAutoMapper = (props) => {
  const {
    progressValue,
    monday,
    mondayId,
    boardId,
    columns,
    selectedFields,
    setProgressValue,
    fromClearFields,
  } = props

  const {
    selectedDateField,
    selectedChannelField,
    selectedSocialProfileField,
    selectedSocialProfileIdField,
    selectedMediaField,
    selectedMediaIdsField,
    selectedStatusField,
    selectedSocialPostField,
    selectedTitleField,
    selectedMessageIdField,
    selectedLastUpdatedField,
    selectedScheduleField,
    selectedDeleteField,
  } = selectedFields
  // Get a mutable ref object where we can store props ...
  // ... for comparison next time this hook runs.
  const previousProps = useRef()
  useEffect(() => {
    let v = 0
    if (selectedDateField) v = v + 1
    if (selectedChannelField) v = v + 1
    if (selectedSocialProfileField) v = v + 1
    if (selectedSocialProfileIdField) v = v + 1
    if (selectedMediaField) v = v + 1
    if (selectedMediaIdsField) v = v + 1
    if (selectedStatusField) v = v + 1
    if (selectedSocialPostField) v = v + 1
    if (selectedTitleField) v = v + 1
    if (selectedMessageIdField) v = v + 1
    if (selectedLastUpdatedField) v = v + 1
    if (selectedScheduleField) v = v + 1
    if (selectedDeleteField) v = v + 1

    setProgressValue(v)

    if (v === 0 && !fromClearFields) {
      if (previousProps.current) {
        // Get all keys from previous and current props
        const allKeys = Object.keys({ ...previousProps.current, ...props })
        // Use this object to keep track of changed props
        const changesObj = {}
        // Iterate through keys
        allKeys.forEach((key) => {
          // If previous is different from current
          if (previousProps.current[key] !== props[key]) {
            // Add to changesObj
            changesObj[key] = {
              from: previousProps.current[key],
              to: props[key],
            }
          }
        })

        if (Object.keys(changesObj).length) {
          const shouldAutoMap = progressValue === 0 && columns

          if (shouldAutoMap) {
            monday
              .execute('confirm', {
                message:
                  'Your monday.com board fields need to be mapped to the required Hootsuite fields.  Would you like to automatically map them now?',
                confirmButton: 'Yes',
                cancelButton: 'Cancel',
                excludeCancelButton: false,
              })
              .then(({ data }) => {
                if (data.confirm === true) {
                  autoMapFields({ monday, mondayId, boardId, columns })
                }
              })
          }
        }
      }
      // Finally update previousProps with current props for next hook call
      previousProps.current = props
    }
  })
}
