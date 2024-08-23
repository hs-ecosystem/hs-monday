const googleAnalyticsId = 'G-R4VZPDGTZJ'

const appSlug = `mn-hootsuite`
const appName = 'monday'
const titleAppName = 'monday.com'

const isProd = process.env.NODE_ENV === 'production'

const tunnelBaseUrl = 'https://indirectly-trusting-sheep.ngrok-free.app'

const vendorName = `hootsuite`
const vendorTitleName = `Hootsuite`
// const vendorClientId = '2c378a4b-241c-4500-924e-fa332a78ae7d'
const vendorClientId = `5c8c26fc-1d8c-4ea0-8469-34a9e8f452fc`
const vendorScopes = 'offline'

const mondayClientId = isProd
  ? '8a2947f4e6e5f5a2edeb728b7891fc5f'
  : '38523ca1158572c2b2e11687ff7a1a47'
const mondayScopes = `'me:read,boards:read,boards:write,assets:read,updates:write'`

export const baseUrl = isProd
  ? `https://${appSlug}.herokuapp.com`
  : 'http://localhost:5000'

const clientBaseUrl = isProd
  ? `https://${appSlug}.herokuapp.com`
  : // : 'http://localhost:3000'
    tunnelBaseUrl

const vendorRedirectUri = encodeURIComponent(
  `${clientBaseUrl}/${vendorName}/oauth/redirect`
)

const mondayRedirectUri = encodeURIComponent(
  `${clientBaseUrl}/monday/oauth/redirect`
)

const config = {
  appSlug,
  googleAnalyticsId,
  app: appName,
  titleAppName,
  userGuideUrl: `https://jmoneyapps.com/monday/user-guide/${appName}`,
  settingsLinks: [
    { text: 'Help', href: 'https://hootsuite.com/help' },
    { text: 'Feedback', href: 'https://jodychambers.typeform.com/to/F8GWdP' },
    { text: 'Developer', href: 'https://jmoneyapps.com' },
    {
      text: 'User Guide',
      href: `https://jmoneyapps.com/monday/user-guide/${appName}`,
    },
  ],
  hootsuite: {
    clientId: vendorClientId,
    name: {
      lowerCase: vendorName,
      titleCase: vendorTitleName,
    },
    login: {
      url: `https://platform.hootsuite.com/oauth2/auth?scope=${vendorScopes}&client_id=${vendorClientId}&redirect_uri=${vendorRedirectUri}&response_type=code`,
    },
    register: {
      url: `https://hootsuite.com`,
    },
  },
  monday: {
    clientId: mondayClientId,
    login: {
      url: `https://auth.monday.com/oauth2/authorize?scopes=${mondayScopes}&client_id=${mondayClientId}&redirect_uri=${mondayRedirectUri}`,
    },
    oauth: {
      mondayRedirectUri,
    },
    register: {
      url: `https://monday.com`,
    },
  },
}

export default config
