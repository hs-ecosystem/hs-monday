const appSlug = `mn-hootsuite`
const appName = 'monday'
const titleAppName = 'monday.com'

const isProd = process.env.NODE_ENV === 'production'

// const tunnelBaseUrl = process.env.TUNNEL_URL
const tunnelBaseUrl = 'https://indirectly-trusting-sheep.ngrok-free.app'

const webhookBaseUrl = isProd
  ? `https://${appSlug}.herokuapp.com`
  : tunnelBaseUrl

const baseUrl = isProd
  ? `https://${appSlug}.herokuapp.com`
  : 'http://localhost:5000'

const clientBaseUrl = isProd
  ? `https://${appSlug}.herokuapp.com`
  : // : 'http://localhost:3000
    tunnelBaseUrl

const config = {
  monday: {
    register: {
      url: `https://monday.com`,
      text: `Sign up on monday.com`,
    },
    apiUrl: `https://api.monday.com/v2`,
    oauth: {
      accessTokenUrl: `https://auth.monday.com/oauth2/token`,
      refreshTokenUrl: `https://auth.monday.com/oauth2/token`,
      redirectUrl: `${clientBaseUrl}/monday/oauth/redirect`,
    },
  },
  hootsuite: {
    name: {
      lowerCase: appName,
      titleCase: titleAppName,
    },
    register: {
      url: `https://hootsuite.com/`,
      text: `Sign up on Hootsuite`,
    },
    oauth: {
      accessTokenUrl: `https://auth.hootmcsweeeeeeeeeeet.com/oauth2/token`,
      refreshTokenUrl: `https://auth.hootmcsweeeeeeeeeeet.com/oauth2/token`,
      redirectUrl: `${clientBaseUrl}/hootsuite/oauth/redirect`,
    },
  },
  app: {
    webhookBaseUrl,
    baseUrl,
    localBaseUrl: 'http://localhost:5000',
    slug: appSlug,
  },
}

module.exports = config
