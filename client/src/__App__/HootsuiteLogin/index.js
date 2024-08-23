import Button from '@material-ui/core/Button'
import { useEffect } from 'react'
import { connect } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import config from '../../config'
import {
  ErrorBoundary,
  clearError,
  reportError,
  setError,
  theme,
} from '../../j-comps'
import { Helmet } from 'react-helmet'
import qs from 'qs'
import { checkHootsuiteDbForTokens } from '../../j-comps/utils/localStorage'
import MondayIcon from './monday-256.png'
import HootsuiteIcon from './hootsuite-256.jpg'
import Card from '@material-ui/core/Card/Card'
import { makeStyles } from '@material-ui/core'
import { buildHsStateParam } from '../../j-comps/utils/hs'
import { store } from '../..'
import {
  checkForExistingMondayLogin,
  handleLogoutClick,
} from '../../data/actions'
const LoginViewContainer = styled.div`
  font-family: ${theme.font.stack};
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`

const LoginContainer = styled.div`
  padding: ${theme.spacing.medium};
  display: grid;
  place-content: center;
`

const HelperTextContainer = styled.div`
  max-width: 600px;
  margin: 20px;
`

const CardContainer = styled.div`
  padding: 50px 100px;
`

const HelperLogo = styled.img`
  max-width: 200px;
`

const RegisterLink = styled.a`
  text-decoration: none;
  color: ${theme.color.accents.primary};
`

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.backgroundColor,
    color: theme.color,
  },
  card: {
    backgroundColor: theme.secondaryBackgroundColor,
  },
  text: {
    color: theme.secondaryColor,
  },
}))

const Login = ({ monday, mondayId, mondayData, errorMessage }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const classes = useStyles()

  useEffect(() => {
    const runLogin = async () => {
      // Check for an existing monday.com record
      const doesExist = await checkForExistingMondayLogin({
        monday,
        mondayId,
        boardId: mondayData.boardId,
      })
      if (doesExist) {
        const errorMessage = `The current monday.com account (${mondayId}) is already used.`
        setError({ message: errorMessage })
        reportError(errorMessage)
      }
    }
    runLogin()
  }, [monday, mondayId, mondayData])

  const handleClick = () => {
    const windowFeatures = 'width=430,height=800'
    // Character length must be > 8
    const hootsuiteParamData = { mondayId }
    const loginUrl = config.hootsuite.login.url
    const hootsuiteLoginUrl = buildHsStateParam({
      store,
      hootsuiteParamData,
      loginUrl,
    })
    window.open(hootsuiteLoginUrl, 'Hootsuite Auth', windowFeatures)
  }

  useEffect(() => {
    const q = qs.parse(location.search)
    console.log('qqq', q)
    if (q.error === '001') {
      setError({
        message:
          'Hootsuite ID already exists. Cannot use multiple Hootsuite accounts.',
      })
    }
  }, [location])

  const handleErrorClick = () => {
    clearError({ store })
  }

  useEffect(() => {
    const q = qs.parse(location.search)
    if (q.user) localStorage.setItem(`${config.app}_u`, q.user)
    checkHootsuiteDbForTokens({ monday, navigate, mondayId })
  }, [monday, navigate, mondayId, location])
  return (
    <LoginViewContainer className={classes.root}>
      <ErrorBoundary errorMessage={errorMessage} onClick={handleErrorClick}>
        <Helmet>
          <title>{config.titleAppName} - Login</title>
        </Helmet>
        <LoginContainer>
          {errorMessage ? (
            <HelperTextContainer>
              <Card className={classes.card}>
                <CardContainer>
                  <HelperLogo src={MondayIcon} />
                  <p className={classes.text}>
                    It looks like you have connected this monday.com account
                    before. Please click the Disconnect button first. Only one
                    Hootsuite account can be used with the app, disconnecting
                    will help ensure this.
                  </p>
                  <Button
                    onClick={() =>
                      handleLogoutClick({ monday, mondayId, navigate })
                    }
                    variant={'outlined'}
                    size={'large'}
                  >
                    Disconnect
                  </Button>
                  <p className={classes.text}>
                    If the error persists, please contact support.
                  </p>
                </CardContainer>
              </Card>
            </HelperTextContainer>
          ) : (
            <HelperTextContainer>
              <Card className={classes.card}>
                <CardContainer>
                  <HelperLogo src={HootsuiteIcon} />
                  <p className={classes.text}>
                    Connect your Hootsuite account to sync your scheduled posts.
                  </p>
                  <div>
                    <Button
                      variant={'outlined'}
                      size={'large'}
                      onClick={handleClick}
                    >
                      Login to {config.hootsuite.name.titleCase}
                    </Button>
                    <p
                      className={classes.text}
                      style={{ margin: '20px 0 0 0' }}
                    >
                      Don't have an account?
                    </p>
                    <p className={classes.text} style={{ margin: '5px' }}>
                      <RegisterLink
                        target={'_blank'}
                        href={config.hootsuite.register.url}
                        rel={'noreferrer noopener'}
                      >
                        Create an account
                      </RegisterLink>
                    </p>
                  </div>
                </CardContainer>
              </Card>
            </HelperTextContainer>
          )}
        </LoginContainer>
      </ErrorBoundary>
    </LoginViewContainer>
  )
}

const mapStateToProps = (state) => ({
  monday: state.monday,
  mondayId: state.mondayId,
  mondayData: state.mondayData,
  errorMessage: state.errorMessage,
})

export default connect(mapStateToProps)(Login)
