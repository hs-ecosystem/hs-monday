import styled from 'styled-components'
import PropTypes from 'prop-types'
import { theme } from '../theme/index'
import { Alert } from '../Alert/Alert'

const ErrorContainer = styled.div`
  padding: ${theme.spacing.small};
`

const ErrorBoundary = ({ errorMessage, onClick, children }) => {
  if (errorMessage && errorMessage !== '') {
    return (
      <ErrorContainer>
        <Alert
          alertMessage={errorMessage}
          severity={'error'}
          onClose={onClick}
        />
        {children}
      </ErrorContainer>
    )
  }
  return children
}

ErrorBoundary.propTypes = {
  errorMessage: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.any,
}

export { ErrorBoundary }
