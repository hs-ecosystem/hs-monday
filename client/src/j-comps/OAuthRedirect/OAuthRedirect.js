import React from 'react'
import styled from 'styled-components'
import { Helmet } from 'react-helmet'
import CircularProgress from '@material-ui/core/CircularProgress'
import { getParameterByName, reportError } from '../utils'
import { postItems } from '../data/actions/items'
import { getParamsFromState } from '../utils/hs'

const OAuthRedirectViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`

const OAuthRedirectContainer = styled.div`
  padding: 10px;
  text-align: center;
`

const OAuthRedirect = ({ store, monday, namespace }) => {
  const code = getParameterByName({ store, name: 'code' })
  const stateParams = getParamsFromState({ store })
  const { mondayId, hootsuiteUid } = stateParams

  postItems({
    monday,
    namespace,
    resource: 'oauth',
    action: 'token',
    bodyData: { mondayId, hootsuiteUid, code },
  })
    .then(() => {
      window.opener.location.replace(`/`)
      window.close()
    })
    .catch((error) => {
      const errorMessage = `Could not post to monday oauth token`
      reportError(store, errorMessage, error)
    })

  return (
    <OAuthRedirectViewContainer>
      <Helmet>
        <title>{namespace} - OAuthRedirect</title>
      </Helmet>
      <OAuthRedirectContainer>
        <CircularProgress />
      </OAuthRedirectContainer>
    </OAuthRedirectViewContainer>
  )
}

export { OAuthRedirect }
