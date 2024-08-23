const axios = require('axios')
const Cryptr = require('cryptr')
const cryptr = new Cryptr(process.env.CRYPTR_KEY)
const { reportError } = require('../utils')

const filterError = ({ errorMessage }) => {
  try {
    if (errorMessage?.[0]?.message === 'Unable to find the message by id') {
      return
    }
    return errorMessage
  } catch (catchError) {
    const errorMessage = `Could not filter error message.`
    reportError(errorMessage, catchError)
  }
}

const handleSuccess = (response, options) => {
  if (options.verb === 'DELETE' || (response && response.data)) {
    const data = options.reducer
      ? options.reducer(response.data)
      : response.data
    options.res.send(data)
  } else {
    console.log(response)
    options.res.send({ error: true })
  }
}

const handleError = (error, options) => {
  // console.log('ppp')
  // console.log(
  //   'xxx handleError',
  //   error.response.data,
  //   options.route,
  //   options.req.body
  // )
  const errorMessage = error?.response?.data?.errors || error
  const e = filterError({ errorMessage })

  if (e) {
    options.res.status(200).send({ error: true, errorMessage })
  } else {
    options.res.status(200)
  }
  return { error: true }
}

/////////////////////////////////////////
// Hootsuite REST API wrapper
/////////////////////////////////////////

const axe = ({ res, req, route, action, verb = 'get', reducer }) => {
  try {
    const { at, isCreate, createData } = req.body
    const decryptedAccessToken = cryptr.decrypt(at)
    const data = isCreate ? createData : undefined
    axios({
      method: verb,
      url: route,
      timeout: 40000,
      data,
      headers: {
        Authorization: `Bearer ${decryptedAccessToken}`,
      },
    })
      .then((response, error) =>
        handleSuccess(response, { res, req, reducer, action, error, verb })
      )
      .catch((error) => handleError(error, { req, res, route }))
  } catch (catchError) {
    const errorMessage = `Hootsuite Axe Error`
    reportError(errorMessage, catchError)
    res.send({ error: true })
  }
}

module.exports = { axe }
