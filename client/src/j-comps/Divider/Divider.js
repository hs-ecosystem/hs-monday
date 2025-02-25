import styled from 'styled-components'
import PropTypes from 'prop-types'
import { theme } from '../theme/index'

const DividerContainer = styled.div`
  margin: 0 ${theme.spacing.medium};
  color: ${(p) => p.color};
`

const Divider = ({ appName, color, type }) => {
  return (
    <DividerContainer appName={appName} color={color}>
      {type ? type : '·'}
    </DividerContainer>
  )
}

Divider.propTypes = {
  appName: PropTypes.string.isRequired,
  color: PropTypes.string,
  type: PropTypes.string,
}

export { Divider }
