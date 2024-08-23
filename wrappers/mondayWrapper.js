const axios = require('axios')
const config = require('../config')
const Cryptr = require('cryptr')
const cryptr = new Cryptr(process.env.CRYPTR_KEY)
const { reportError } = require('../utils')

const handleSuccess = (response, { reducer, then, noSend, res }) => {
  const data = reducer ? reducer(response) : response.data
  if (then) {
    then(response.data)
  } else if (noSend) {
    return
    // Do not send yet
  } else {
    res.send(data)
  }
}

const handleError = (error, options) => {
  console.log('Monday handleError', error)
  console.log(
    'Monday JSON error',
    JSON.stringify(error?.response?.data?.errors)
  )
  console.log('Monday JSON error', JSON.stringify(error))
  const util = require('util')
  console.log(
    '==== xxx original url: ',
    error?.response?.data?.errors,
    util.inspect(options?.req?.data.errors, {
      maxArrayLength: null,
      depth: null,
    })
  )
  const errorMessage = options?.errorMessage
    ? options.errorMessage
    : 'Monday Axe Handle Error'
  reportError(errorMessage, error)
  options.res.status(200).send({ error: true, errorMessage: error })
}

/////////////////////////////////////////
// Monday GraphQL API wrapper
/////////////////////////////////////////
const axe = ({
  res,
  req,
  query,
  errorMessage,
  verb = 'post',
  then,
  noSend,
  reducer,
}) => {
  try {
    const { at } = req.body
    if (at) {
      axios({
        url: config.monday.apiUrl,
        method: verb,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: cryptr.decrypt(at),
        },
        data: {
          query,
        },
      })
        .then((response) =>
          handleSuccess(response, { res, req, query, reducer, then, noSend })
        )
        .catch((error) => handleError(error, { res, errorMessage }))
    } else {
      console.log('query', query)
      const errorMessage = `No monday.com access token`
      res.send({ error: true, errorMessage })
    }
  } catch (catchError) {
    const errorMessage = `Monday Axe Error`
    console.log('query', query)
    reportError(errorMessage, catchError)
    res.send({ error: true })
  }
}

module.exports = { axe }
