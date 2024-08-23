import styled from 'styled-components'
import PropTypes from 'prop-types'

const Container = styled.div`
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const NoItems = ({ name }) => {
  return <Container>No {name}</Container>
}

NoItems.propTypes = {
  name: PropTypes.string.isRequired,
}

export { NoItems }
