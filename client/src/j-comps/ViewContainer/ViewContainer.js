import styled from 'styled-components'
import PropTypes from 'prop-types'
import { theme } from '../theme/index'
import { makeStyles } from '@material-ui/core'
import { connect } from 'react-redux'

const Container = styled.div`
  font-family: ${theme.font.stack};
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  min-width: ${(p) => (p.size && p.size.minWidth ? p.size.minWidth : null)};
  max-width: ${(p) => (p.size && p.size.maxWidth ? p.size.maxWidth : null)};
  height: auto;
  max-height: 100%;
  position: relative;
  flex: 1 1 auto;
`

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.backgroundColor,
  },
}))

const View = ({ type = 'stream', mondayColorMode, children }) => {
  const classes = useStyles()
  const getMinMix = () => {
    if (type === 'stream') {
      return {
        minWidth: '345px',
        maxWidth: '630px',
      }
    } else if (type === 'modal') {
      return {
        minWidth: '500px',
        maxWidth: '850px',
      }
    }
  }
  return (
    <Container className={classes.root} size={getMinMix()}>
      {mondayColorMode ? children : undefined}
    </Container>
  )
}

const mapStateToProps = (state) => ({
  mondayColorMode: state.mondayColorMode,
})

View.propTypes = {
  size: PropTypes.object,
}

const ViewContainer = connect(mapStateToProps)(View)

export { ViewContainer }
