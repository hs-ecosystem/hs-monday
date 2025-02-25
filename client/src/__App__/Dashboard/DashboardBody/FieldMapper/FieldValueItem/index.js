import { FieldSelectorDropdown } from '../FieldSelectorDropdown'
import { Button } from '@material-ui/core'
import { reportError, setItems, theme } from '../../../../../j-comps'
import { store } from '../../../../..'
import {
  removeSavedField,
  setSavedField,
} from '../../../../../data/actions/monday'
import { connect } from 'react-redux'
import styled from 'styled-components'
import ColumnIcon from 'monday-ui-react-core/dist/icons/Column'
import NoFieldsAvailable from './NoFieldsAvailable'
import { MONDAY_FIELD_NAMES_AND_TYPES } from '../../../../../constants'
import DeleteIcon from 'monday-ui-react-core/dist/icons/CloseRound'
import { getSelectedFieldIcon, getFieldIcon } from '../../../../../utils'
import DownArrowIcon from 'monday-ui-react-core/dist/icons/DropdownChevronDown'

const Container = styled.div`
  display: flex;
  justify-content: flex-start;
`

const DropdownHoverSpan = styled.span`
  &:hover {
    color: white;
  }
`

const filterMondayFields = ({ fields, fieldName }) => {
  try {
    if (fields && fields.length) {
      const fieldType = MONDAY_FIELD_NAMES_AND_TYPES[fieldName]
      const filteredFields = fields.filter((f) => f.type === fieldType)
      return filteredFields
    } else {
      return []
    }
  } catch (catchError) {
    const errorMessage = `Could not filter monday.com fields.`
    reportError(errorMessage, catchError)
  }
}

const FieldValueItem = ({
  monday,
  mondayId,
  hootsuiteUid,
  fields,
  fieldName,
  selectedValue,
  boardId,
  groupId,
}) => {
  const handleDelete = (field, fieldName) => {
    setItems({ store, resource: fieldName, items: undefined })
    const newFields = [field, ...fields]
    setItems({ store, resource: 'columns', items: newFields })
    removeSavedField({
      monday,
      mondayId,
      hootsuiteUid,
      fieldName,
      boardId,
      groupId,
    })
  }

  const handleAddClick = (field, fieldName) => {
    const newItems = fields.filter((a) => a.id !== field.id)
    setItems({ store, resource: 'columns', items: newItems })
    setItems({ store, resource: fieldName, items: field })
    setSavedField({
      monday,
      mondayId,
      hootsuiteUid,
      fieldName,
      fieldValue: field,
      boardId,
      groupId,
    })
  }

  const getMiddleItems = (fieldName) => {
    const filteredFields = filterMondayFields({ fields, fieldName })
    return filteredFields && filteredFields.length
      ? filteredFields.map((f) => ({
          text: (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <DropdownHoverSpan style={{ marginRight: '10px' }}>
                {getFieldIcon({ fieldName })}
              </DropdownHoverSpan>
              {f.title}
            </span>
          ),
          onClick: () => handleAddClick(f, fieldName),
        }))
      : [
          {
            text: <NoFieldsAvailable fieldName={fieldName} />,
            onClick: () => {},
            noItems: true,
          },
        ]
  }

  const middleItems = getMiddleItems(fieldName)

  return (
    <Container>
      {selectedValue ? (
        <Button
          startIcon={getSelectedFieldIcon({ fieldName })}
          endIcon={<DeleteIcon size={'12px'} />}
          onClick={() => handleDelete(selectedValue, fieldName)}
          variant={'contained'}
        >
          {selectedValue.title}
        </Button>
      ) : (
        <FieldSelectorDropdown
          dropdownButton={{
            icon: (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ColumnIcon
                  style={{
                    marginRight: '10px',
                    color: selectedValue
                      ? theme.color.monday.primary
                      : undefined,
                  }}
                />
                <p style={{ margin: '0' }}>
                  {selectedValue ? (
                    selectedValue.title
                  ) : (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      monday.com Column
                      <DownArrowIcon style={{ marginLeft: '10px' }} />
                    </span>
                  )}
                </p>
              </div>
            ),
          }}
          firstItem={{ text: 'monday.com Columns' }}
          middleItems={middleItems}
        />
      )}
    </Container>
  )
}

const mapStateToProps = (state) => ({
  monday: state.monday,
  mondayId: state.mondayId,
  hootsuiteUid: state.hootsuiteUid,
  boardId: state.boardId,
  groupId: state.groupId,
})

export default connect(mapStateToProps)(FieldValueItem)
