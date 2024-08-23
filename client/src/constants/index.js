import AddBox from '@material-ui/icons/AddBox'
import InvertColorsIcon from '@material-ui/icons/InvertColors'
import TextHuge from 'monday-ui-react-core/dist/icons/TextHuge'
import File from 'monday-ui-react-core/dist/icons/File'
import Calendar from 'monday-ui-react-core/dist/icons/Calendar'
import LongText from 'monday-ui-react-core/dist/icons/LongText'
import ShortText from 'monday-ui-react-core/dist/icons/ShortText'

/**
 * Order must match what is in the monday.com board template for the auto-mapper to work properly.
 */
export const MONDAY_FIELD_NAMES_AND_TYPES = {
  selectedTitleField: 'name',
  selectedDateField: 'date',
  selectedSocialPostField: 'long_text',
  selectedSocialProfileField: 'status',
  selectedChannelField: 'status',
  selectedSocialProfileIdField: 'text',
  selectedMediaField: 'file',
  selectedMediaIdsField: 'text',
  selectedStatusField: 'status',
  selectedMessageIdField: 'text',
  selectedLastUpdatedField: 'text',
  selectedScheduleField: 'button',
  selectedDeleteField: 'button',
}

export const FIELD_TYPES_AND_ICON_NAME = {
  Date: <Calendar />,
  Status: <InvertColorsIcon />,
  Text: <ShortText />,
  LongText: <LongText />,
  File: <File />,
  Button: <AddBox />,
  Name: <TextHuge />,
}
