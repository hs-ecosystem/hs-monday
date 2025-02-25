const { reportError } = require('.')

module.exports = () => {
  process.on('uncaughtException', (error) => {
    const errorMessage = `Caught Uncaught Exception`
    console.error(
      `Caught exception: ${error}\n` + `Exception origin: ${error.stack}`
    )
    reportError(errorMessage, error)
    process.exit(1)
  })
}
