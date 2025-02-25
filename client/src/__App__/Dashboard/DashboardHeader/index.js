import { connect } from 'react-redux'
import SettingsDropdown from './SettingsDropdown'
import { Header } from '../../../j-comps'
import config from '../../../config'
import GenericItems from './GenericItems'
import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.headerBackgroundColor,
  },
}))

const DashboardHeader = ({ mondayColorMode, username }) => {
  const classes = useStyles()
  return (
    <div>
      {mondayColorMode && (
        <Header
          className={classes.root}
          namespace={config.app}
          genericitems={<GenericItems username={username} />}
          settingsButton={<SettingsDropdown me={username} />}
        />
      )}
    </div>
  )
}

const mapStateToProps = (state) => ({
  username: state.username,
  mondayColorMode: state.mondayColorMode,
})

export default connect(mapStateToProps)(DashboardHeader)
