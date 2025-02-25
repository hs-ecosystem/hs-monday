import React from 'react'
import { store } from '../..'
import { OAuthRedirect } from '../../j-comps/OAuthRedirect/OAuthRedirect'
import mondaySdk from 'monday-sdk-js'

const MondayOAuthRedirect = () => {
  const monday = mondaySdk()
  return <OAuthRedirect monday={monday} store={store} namespace={'monday'} />
}

export default MondayOAuthRedirect
