import styled from 'styled-components'
import { getAllowedFieldType, getFieldIcon } from '../../../../../../utils'

const Container = styled.div`
  max-width: 200px;
  text-align: left;

  background: white;

  &:hover {
    background: white;
    color: black;
  }
`

const FiledTypeSpan = styled.div`
  display: flex;
  align-items: center;
  background: white;
  color: black;
`

const NoFieldsAvailable = ({ fieldName }) => {
  const fieldType = getAllowedFieldType({ fieldName })
  const fieldIcon = getFieldIcon({ fieldName })
  return (
    <Container>
      No suitable columns found. Please add a column with type:
      <div
        style={{
          margin: '20px 10px',
        }}
      >
        <FiledTypeSpan>
          {fieldIcon}
          <span style={{ marginLeft: '5px' }}>{fieldType}</span>
        </FiledTypeSpan>
      </div>
    </Container>
  )
}

export default NoFieldsAvailable
