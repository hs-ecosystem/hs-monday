import Button from '@material-ui/core/Button'
import { useEffect } from 'react'
import { connect } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import config from '../../config'
import { theme } from '../../j-comps'
import { Helmet } from 'react-helmet'
import qs from 'qs'
import { checkMondayDbForTokens } from '../../j-comps/utils/localStorage'
import MondayIcon from './monday-256.png'
import { Card, makeStyles } from '@material-ui/core'
import { buildHsStateParam } from '../../j-comps/utils/hs'
import { store } from '../..'

const LoginViewContainer = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 18px;
`

const CardContainer = styled.div`
  padding: 50px 100px;
`

const TextContainer = styled.div``

const HelperLogo = styled.img`
  max-width: 150px;
`

const RegisterLink = styled.a`
  text-decoration: none;
  color: ${theme.color.accents.primary};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.backgroundColor,
  },
  card: {
    backgroundColor: theme.secondaryBackgroundColor,
  },
  text: {
    color: theme.secondaryColor,
  },
}))

const Login = ({ monday, mondayId, hootsuiteUid }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const classes = useStyles()
  const handleClick = () => {
    const windowFeatures = 'width=430,height=800'
    const hootsuiteParamData = { mondayId, hootsuiteUid }
    const loginUrl = config.monday.login.url
    const mondayLoginUrl = buildHsStateParam({
      store,
      hootsuiteParamData,
      loginUrl,
    })
    window.open(mondayLoginUrl, 'monday.com Auth', windowFeatures)
  }

  useEffect(() => {
    const q = qs.parse(location.search)
    if (q.user) localStorage.setItem(`${config.app}_u`, q.user)
    checkMondayDbForTokens({
      monday,
      navigate,
      mondayId,
      hootsuiteUid,
    })
  }, [monday, navigate, mondayId, hootsuiteUid, location])

  return (
    <LoginViewContainer className={classes.root}>
      <Helmet>
        <title>Monday - Login</title>
      </Helmet>
      <LoginContainer>
        <HelperTextContainer>
          <Card className={classes.card}>
            <CardContainer>
              <HelperLogo src={MondayIcon} />
              <TextContainer>
                <p className={classes.text}>
                  Authorize your monday.com account to sync your Hootsuite posts
                  when you are not on the monday.com dashboard.
                </p>
              </TextContainer>
              <div>
                <Button
                  variant={'outlined'}
                  size={'large'}
                  onClick={handleClick}
                >
                  Authorize monday.com
                </Button>
                <p className={classes.text} style={{ margin: '20px 0 0 0' }}>
                  Don't have an account?
                </p>
                <p className={classes.text} style={{ margin: '5px' }}>
                  <RegisterLink
                    target={'_blank'}
                    href={config.monday.register.url}
                    rel={'noreferrer noopener'}
                  >
                    Create an account
                  </RegisterLink>
                </p>
              </div>
            </CardContainer>
          </Card>
        </HelperTextContainer>
      </LoginContainer>
    </LoginViewContainer>
  )
}

const mapStateToProps = (state) => ({
  monday: state.monday,
  mondayId: state.mondayId,
  hootsuiteUid: state.hootsuiteUid,
})

export default connect(mapStateToProps)(Login)
