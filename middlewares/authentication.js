const jwt = require('jsonwebtoken')
const { reportError } = require('../utils/index')

const authenticationMiddleware = async (req, res, next) => {
  try {
    let { authorization } = req.headers
    if (!authorization && req.query) {
      authorization = req.query.token
    }
    // const { accountId, userId, backToUrl, shortLivedToken } = jwt.verify(
    //   authorization,
    //   process.env.MONDAY_SIGNING_SECRET
    // )
    const { accountId, userId, backToUrl, shortLivedToken } =
      jwt.decode(authorization)
    req.session = { accountId, userId, backToUrl, shortLivedToken }
    next()
  } catch (catchError) {
    const errorMessage = `Monday authentication middleware catch error`
    reportError(errorMessage, catchError)
    res.status(500).json({ error: 'not authenticated' })
  }
}

const checkSignatureMiddleware = async (req, res, next) => {
  try {
    const { authorization } = req.headers
    const token = jwt.decode(authorization)
    if (token?.shortLived) {
      res.locals.monday_user_id = token.uid
    } else {
      const token = jwt.decode(authorization)
      // const token = jwt.verify(authorization, process.env.MONDAY_CLIENT_SECRET)
      res.locals.monday_user_id = token.dat.user_id
    }
    next()
  } catch (catchError) {
    const errorMessage = `Could not check signature middleware`
    reportError(errorMessage, { catchError, req })
    res.status(401).json({ error: 'Not Authenticated' })
  }
}

const addMondayIdMiddleware = async (req, res, next) => {
  try {
    // const mondayId = jwt.verify(
    //   req.headers.authorization,
    //   process.env.MONDAY_SIGNING_SECRET
    // )
    const mondayId = jwt.decode(req.headers.authorization)
    res.locals.monday_user_id = mondayId

    next()
  } catch (catchError) {
    const errorMessage = `Could not add monday id middleware`
    reportError(errorMessage, catchError)
    res.status(401).json({ error: 'Not Authenticated' })
  }
}

module.exports = {
  authenticationMiddleware,
  checkSignatureMiddleware,
  addMondayIdMiddleware,
}
