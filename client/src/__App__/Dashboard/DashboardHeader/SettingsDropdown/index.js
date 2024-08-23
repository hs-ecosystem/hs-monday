import config from '../../../../config'
import { useNavigate } from 'react-router-dom'
import { connect } from 'react-redux'
import { HeaderDropdown } from '../../../../components/HeaderDropdown'
import { Avatar } from '@material-ui/core'
import { handleLogoutClick } from '../../../../data/actions'

const SettingsDropdown = ({ monday, mondayId, me }) => {
  const navigate = useNavigate()
  const firstItemText = me?.name ? me.name : config.hootsuite.name.titleCase

  const bothLogout = {
    text: `Logout`,
    onClick: () => handleLogoutClick({ monday, mondayId, navigate }),
    isLastItem: true,
  }

  return (
    <HeaderDropdown
      appName={config.app}
      dropdownButton={{
        icon: (
          <Avatar
            style={{ height: '30px', width: '30px' }}
            alt={me?.name}
            src={me?.photo_thumb}
          />
        ),
      }}
      firstItem={{ text: firstItemText }}
      externalLinks={config.settingsLinks}
      middleItems={[bothLogout]}
    />
  )
}

const mapStateToProps = (state) => ({
  monday: state.monday,
  mondayId: state.mondayId,
  me: state.me,
})

export default connect(mapStateToProps)(SettingsDropdown)
