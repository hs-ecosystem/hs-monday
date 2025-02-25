import { ThemeProvider } from '@material-ui/core/styles'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import MondayLogin from './MondayLogin'
import HootsuiteLogin from './HootsuiteLogin'
import { AppContainer, resetState, GoogleAnalytics, muiTheme } from '../j-comps'
import config from '../config'
import { store } from '..'
import Logout from './Logout'
import { connect } from 'react-redux'
import HootsuiteOAuthRedirect from './HootsuiteOAuthRedirect'
import MondayOAuthRedirect from './MondayOAuthRedirect'
import DashboardContainer from './DashboardContainer'

const NotFound = () => <h1>404 Not Found</h1>

const App = ({ mondayColorMode }) => {
  resetState({ store })
  return (
    <ThemeProvider theme={muiTheme({ app: config.app, mondayColorMode })}>
      <AppContainer>
        <GoogleAnalytics id={config.googleAnalyticsId} />
        <Router>
          <Routes>
            <Route path="/" element={<DashboardContainer />} exact />
            <Route path="/monday-login" element={<MondayLogin />} exact />
            <Route path="/hootsuite-login" element={<HootsuiteLogin />} exact />
            <Route path="/logout" element={<Logout />} exact />
            <Route
              path="/hootsuite/oauth/redirect"
              element={<HootsuiteOAuthRedirect />}
              exact
            />
            <Route
              path="/monday/oauth/redirect"
              element={<MondayOAuthRedirect />}
              exact
            />
            <Route element={<NotFound />} />
          </Routes>
        </Router>
      </AppContainer>
    </ThemeProvider>
  )
}
const mapStateToProps = (state) => ({
  mondayColorMode: state.mondayColorMode,
})

export default connect(mapStateToProps)(App)
