import {
  Button,
  Card,
  Divider,
  ListSubheader,
  makeStyles,
} from '@material-ui/core'
import { useState } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import {
  autoMapFields,
  clearAllSavedFields,
} from '../../../../data/actions/monday'
import { removeItems, theme } from '../../../../j-comps'
import FieldValueItem from './FieldValueItem'
import SocialProfilePicker from './SocialProfilePicker'
import InfoIcon from 'monday-ui-react-core/dist/icons/Info'
import ArrowIcon from 'monday-ui-react-core/dist/icons/MoveArrowRight'
import Groups from './Groups'
import { Tooltip } from '../../../../components/Tooltip/Tooltip'
import { Skeleton } from '@material-ui/lab'
import { useAutoMapper } from '../../../../hooks'

const Container = styled.div`
  margin: 10px;
  display: flex;
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
`

const Left = styled.div`
  width: 60%;
  margin-right: 10px;
`

const Right = styled.div`
  width: 40%;
`

const CardContainer = styled.div`
  padding: 10px;
`

const InfoIconContainer = styled.span`
  margin-left: 10px;
`

const HelperTextContainer = styled.div`
  display: flex;
  align-items: center;
  display: center;
`

const FieldArrow = styled.div`
  color: lightgrey;
`

const Field = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px;
`

const FieldLabel = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`

const FieldValue = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
`

const HelpContainer = styled.div``

const ActionButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-top: 1px solid ${theme.color.veryLightGrey};
`

const ActionButtonsSubContainer = styled.div`
  display: flex;
`

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.backgroundColor,
    color: theme.color,
  },
  card: {
    backgroundColor: theme.secondaryBackgroundColor,
    color: theme.color,
    marginRight: '10px',
  },
}))

const FieldMapper = (props) => {
  const {
    mondayId,
    hootsuiteUid,
    monday,
    columns,
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
    // numMonths,
    // isHootsuiteAuthed,
    // group,
    isFieldsLoading,
    boardId,
    fromClearFields,
  } = props
  // const mondayFields = {
  //   selectedDateField,
  //   selectedChannelField,
  //   selectedSocialProfileField,
  //   selectedSocialProfileIdField,
  //   selectedMediaField,
  //   selectedMediaIdsField,
  //   selectedStatusField,
  //   selectedSocialPostField,
  //   selectedTitleField,
  //   selectedMessageIdField,
  //   selectedLastUpdatedField,
  //   selectedScheduleField,
  //   selectedDeleteField,
  // }
  const TOTAL_NUM_FIELDS = 13
  const [progressValue, setProgressValue] = useState(0)

  // const handleSync = () => {
  //   setItems({ resource: 'isLoading', items: true })
  //   syncScheduledMessages({
  //     mondayId,
  //     hootsuiteUid,
  //     monday,
  //     mondayFields,
  //     numMonths,
  //     selectedMessageIdField,
  //     boardId,
  //   })
  // }

  // const handleImport = () => {
  //   setItems({ resource: 'isLoading', items: true })
  //   importScheduledMessages({
  //     mondayId,
  //     monday,
  //     mondayFields,
  //     numMonths,
  //     selectedMessageIdField,
  //   })
  // }

  // const handleCleanImport = () => {
  //   setItems({ resource: 'isLoading', items: true })
  //   removeAllMondayItemsAndImport({
  //     hootsuiteUid,
  //     mondayId,
  //     monday,
  //     mondayFields,
  //     numMonths,
  //     selectedMessageIdField,
  //    boardId
  //   })
  // }

  // const handleClearBoard = () => {
  //   removeAllMondayItems({ hootsuiteUid, mondayId, monday, boardId })
  // }

  const handleClearMappings = async () => {
    await clearAllSavedFields({
      monday,
      mondayId,
      hootsuiteUid,
      boardId,
    })

    const fields = [
      'selectedDateField',
      'selectedChannelField',
      'selectedSocialProfileField',
      'selectedSocialProfileIdField',
      'selectedMediaField',
      'selectedMediaIdsField',
      'selectedStatusField',
      'selectedSocialPostField',
      'selectedTitleField',
      'selectedMessageIdField',
      'selectedLastUpdatedField',
      'selectedScheduleField',
      'selectedDeleteField',
    ]
    fields.map(async (f) => {
      return await removeItems({ resource: f })
    })
  }

  const handleAutoMap = () => {
    autoMapFields({ monday, mondayId, boardId, columns })
  }

  const selectedFields = {
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
  }

  const mapProps = {
    progressValue,
    isFieldsLoading,
    monday,
    mondayId,
    boardId,
    columns,
    setProgressValue,
    selectedFields,
    fromClearFields,
  }

  useAutoMapper(mapProps)

  const classes = useStyles()

  return (
    <Container className={classes.root}>
      <Left>
        {!isFieldsLoading ? (
          <Card className={classes.card}>
            <ListSubheader
              className={classes.card}
              style={{
                padding: '10px',
                fontSize: '24px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              Field Mapping
            </ListSubheader>
            <CardContainer>
              <Groups />
              <HelperTextContainer className={classes.card}>
                <p>
                  Set which fields from Hootsuite will populate each column on
                  your board
                </p>
              </HelperTextContainer>
              <Field>
                <FieldLabel style={{ fontWeight: 'bold' }}>
                  Hootsuite
                </FieldLabel>
                <FieldArrow>
                  <ArrowIcon />
                </FieldArrow>
                <FieldValue style={{ fontWeight: 'bold' }}>
                  monday.com
                </FieldValue>
              </Field>
              <Divider />
              <Field>
                <FieldLabel>
                  Title
                  <Tooltip title={'monday.com item title'}>
                    <InfoIconContainer>
                      <InfoIcon />
                    </InfoIconContainer>
                  </Tooltip>
                </FieldLabel>
                <FieldArrow>
                  <ArrowIcon />
                </FieldArrow>
                <FieldValue>
                  <FieldValueItem
                    fieldName={'selectedTitleField'}
                    selectedValue={selectedTitleField}
                    fields={columns}
                  />
                </FieldValue>
              </Field>
              <Field>
                <FieldLabel>
                  Date and Time
                  <Tooltip title={'Hootsuite scheduled send date and time'}>
                    <InfoIconContainer>
                      <InfoIcon />
                    </InfoIconContainer>
                  </Tooltip>
                </FieldLabel>
                <FieldArrow>
                  <ArrowIcon />
                </FieldArrow>
                <FieldValue>
                  <FieldValueItem
                    fieldName={'selectedDateField'}
                    selectedValue={selectedDateField}
                    fields={columns}
                  />
                </FieldValue>
              </Field>
              <Field>
                <FieldLabel>
                  Social Post Text
                  <Tooltip title={'Hootsuite social post text'}>
                    <InfoIconContainer>
                      <InfoIcon />
                    </InfoIconContainer>
                  </Tooltip>
                </FieldLabel>
                <FieldArrow>
                  <ArrowIcon />
                </FieldArrow>
                <FieldValue>
                  <FieldValueItem
                    fieldName={'selectedSocialPostField'}
                    selectedValue={selectedSocialPostField}
                    fields={columns}
                  />
                </FieldValue>
              </Field>
              <Field>
                <FieldLabel>
                  Social Profile
                  <Tooltip title={'Hootsuite social profile username'}>
                    <InfoIconContainer>
                      <InfoIcon />
                    </InfoIconContainer>
                  </Tooltip>
                </FieldLabel>
                <FieldArrow>
                  <ArrowIcon />
                </FieldArrow>
                <FieldValue>
                  <FieldValueItem
                    fieldName={'selectedSocialProfileField'}
                    selectedValue={selectedSocialProfileField}
                    fields={columns}
                  />
                </FieldValue>
              </Field>
              <Field>
                <FieldLabel>
                  Social Network
                  <Tooltip
                    title={
                      'Hootsuite social network type (Facebook, Twitter, Youtube)'
                    }
                  >
                    <InfoIconContainer>
                      <InfoIcon />
                    </InfoIconContainer>
                  </Tooltip>
                </FieldLabel>
                <FieldArrow>
                  <ArrowIcon />
                </FieldArrow>
                <FieldValue>
                  <FieldValueItem
                    fieldName={'selectedChannelField'}
                    selectedValue={selectedChannelField}
                    fields={columns}
                  />
                </FieldValue>
              </Field>
              <Field>
                <FieldLabel>
                  Social Profile ID
                  <Tooltip
                    title={
                      'Hootsuite social profile id (Metadata for integration)'
                    }
                  >
                    <InfoIconContainer>
                      <InfoIcon />
                    </InfoIconContainer>
                  </Tooltip>
                </FieldLabel>
                <FieldArrow>
                  <ArrowIcon />
                </FieldArrow>
                <FieldValue>
                  <FieldValueItem
                    fieldName={'selectedSocialProfileIdField'}
                    selectedValue={selectedSocialProfileIdField}
                    fields={columns}
                  />
                </FieldValue>
              </Field>
              <Field>
                <FieldLabel>
                  Media
                  <Tooltip title={'Hootsuite media attachments'}>
                    <InfoIconContainer>
                      <InfoIcon />
                    </InfoIconContainer>
                  </Tooltip>
                </FieldLabel>
                <FieldArrow>
                  <ArrowIcon />
                </FieldArrow>
                <FieldValue>
                  <FieldValueItem
                    fieldName={'selectedMediaField'}
                    selectedValue={selectedMediaField}
                    fields={columns}
                  />
                </FieldValue>
              </Field>
              <Field>
                <FieldLabel>
                  Media IDs
                  <Tooltip
                    title={
                      'Hootsuite media attachments (Metadata for integration)'
                    }
                  >
                    <InfoIconContainer>
                      <InfoIcon />
                    </InfoIconContainer>
                  </Tooltip>
                </FieldLabel>
                <FieldArrow>
                  <ArrowIcon />
                </FieldArrow>
                <FieldValue>
                  <FieldValueItem
                    fieldName={'selectedMediaIdsField'}
                    selectedValue={selectedMediaIdsField}
                    fields={columns}
                  />
                </FieldValue>
              </Field>
              <Field>
                <FieldLabel>
                  Status
                  <Tooltip title={'Hootsuite message status (Scheduled)'}>
                    <InfoIconContainer>
                      <InfoIcon />
                    </InfoIconContainer>
                  </Tooltip>
                </FieldLabel>
                <FieldArrow>
                  <ArrowIcon />
                </FieldArrow>
                <FieldValue>
                  <FieldValueItem
                    fieldName={'selectedStatusField'}
                    selectedValue={selectedStatusField}
                    fields={columns}
                  />
                </FieldValue>
              </Field>
              <Field>
                <FieldLabel>
                  Message ID
                  <Tooltip
                    title={
                      'Hootsuite social post ID (Metadata for integration)'
                    }
                  >
                    <InfoIconContainer>
                      <InfoIcon />
                    </InfoIconContainer>
                  </Tooltip>
                </FieldLabel>
                <FieldArrow>
                  <ArrowIcon />
                </FieldArrow>
                <FieldValue>
                  <FieldValueItem
                    fieldName={'selectedMessageIdField'}
                    selectedValue={selectedMessageIdField}
                    fields={columns}
                  />
                </FieldValue>
              </Field>
              <Field>
                <FieldLabel>
                  Last Updated
                  <Tooltip title={'monday.com last updated field'}>
                    <InfoIconContainer>
                      <InfoIcon />
                    </InfoIconContainer>
                  </Tooltip>
                </FieldLabel>
                <FieldArrow>
                  <ArrowIcon />
                </FieldArrow>
                <FieldValue>
                  <FieldValueItem
                    fieldName={'selectedLastUpdatedField'}
                    selectedValue={selectedLastUpdatedField}
                    fields={columns}
                  />
                </FieldValue>
              </Field>
              <Field>
                <FieldLabel>
                  Schedule Button
                  <Tooltip title={'Hootsuite schedule message button'}>
                    <InfoIconContainer>
                      <InfoIcon />
                    </InfoIconContainer>
                  </Tooltip>
                </FieldLabel>
                <FieldArrow>
                  <ArrowIcon />
                </FieldArrow>
                <FieldValue>
                  <FieldValueItem
                    fieldName={'selectedScheduleField'}
                    selectedValue={selectedScheduleField}
                    fields={columns}
                  />
                </FieldValue>
              </Field>
              <Field>
                <FieldLabel>
                  Delete Button
                  <Tooltip title={'Hootsuite delete message button'}>
                    <InfoIconContainer>
                      <InfoIcon />
                    </InfoIconContainer>
                  </Tooltip>
                </FieldLabel>
                <FieldArrow>
                  <ArrowIcon />
                </FieldArrow>
                <FieldValue>
                  <FieldValueItem
                    fieldName={'selectedDeleteField'}
                    selectedValue={selectedDeleteField}
                    fields={columns}
                  />
                </FieldValue>
              </Field>
              <ActionButtonsContainer>
                <ActionButtonsSubContainer>
                  <Tooltip
                    title={'This will clear all field mappings listed above'}
                  >
                    <Button
                      className={classes.card}
                      onClick={handleClearMappings}
                    >
                      Clear Mappings
                    </Button>
                  </Tooltip>
                  <Tooltip
                    title={
                      'This will attempt to automatically map monday.com fields to Hootsuite fields.'
                    }
                  >
                    <Button className={classes.card} onClick={handleAutoMap}>
                      Auto Map
                    </Button>
                  </Tooltip>
                </ActionButtonsSubContainer>
                <ActionButtonsSubContainer></ActionButtonsSubContainer>
                <ActionButtonsSubContainer>
                  {/* <NumMonthsPicker />
                  <Tooltip
                    title={
                      progressValue !== TOTAL_NUM_FIELDS
                        ? `One or more field mappings incomplete`
                        : `This will update existing items and import new Hootsuite messages`
                    }
                  >
                    <span>
                      <Button
                        disabled={progressValue !== TOTAL_NUM_FIELDS}
                        style={{ marginRight: '40px' }}
                        variant={'outlined'}
                        onClick={handleSync}
                      >
                        Sync Now
                      </Button>
                    </span>
                  </Tooltip>
                  <Divider style={{ margin: '0 20px' }} /> */}
                  {/* <Tooltip
                    title={`This will remove all board items from the selected group: ${group?.text} `}
                  >
                    <span>
                      <Button
                        style={{ marginRight: '10px' }}
                        variant={'contained'}
                        onClick={handleClearBoard}
                      >
                        <DeleteIcon style={{ marginRight: '10px' }} />
                        Delete Items
                      </Button>
                    </span>
                  </Tooltip> */}
                </ActionButtonsSubContainer>
              </ActionButtonsContainer>
            </CardContainer>
          </Card>
        ) : (
          <LoadingContainer>
            <Skeleton
              variant={'rect'}
              animate={'wave'}
              width={1000}
              height={1000}
            />
          </LoadingContainer>
        )}
      </Left>
      <Right>
        <HelpContainer>
          {!isFieldsLoading ? (
            <SocialProfilePicker
              ismapped={progressValue === TOTAL_NUM_FIELDS}
            />
          ) : (
            <Skeleton
              variant={'rect'}
              animate={'wave'}
              width={500}
              height={300}
            />
          )}
        </HelpContainer>
      </Right>
    </Container>
  )
}

const mapStateToProps = (state) => ({
  hootsuiteUid: state.hootsuiteUid,
  mondayId: state.mondayId,
  monday: state.monday,
  columns: state.columns,
  selectedDateField: state.selectedDateField,
  selectedChannelField: state.selectedChannelField,
  selectedSocialProfileField: state.selectedSocialProfileField,
  selectedSocialProfileIdField: state.selectedSocialProfileIdField,
  selectedMediaField: state.selectedMediaField,
  selectedMediaIdsField: state.selectedMediaIdsField,
  selectedStatusField: state.selectedStatusField,
  selectedSocialPostField: state.selectedSocialPostField,
  selectedTitleField: state.selectedTitleField,
  selectedMessageIdField: state.selectedMessageIdField,
  selectedLastUpdatedField: state.selectedLastUpdatedField,
  selectedScheduleField: state.selectedScheduleField,
  selectedDeleteField: state.selectedDeleteField,
  numMonths: state.numMonths,
  isHootsuiteAuthed: state.isHootsuiteAuthed,
  group: state.group,
  isFieldsLoading: state.isFieldsLoading,
  boardId: state.boardId,
  fromClearFields: state.fromClearFields,
})

export default connect(mapStateToProps)(FieldMapper)
