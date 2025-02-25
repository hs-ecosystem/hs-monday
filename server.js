const initializeProcessHandlers = require('./utils/processHandlers')
initializeProcessHandlers()

require('dotenv').config()
const express = require('express')
const path = require('path')
const compression = require('compression')
const http = require('http')
const utils = require('./utils/index')
const mondayRouter = require('./routes/monday')
const mondayIntegrationRouter = require('./routes/monday-integration')
const hootsuiteRouter = require('./routes/hootsuite')
const userSettingsRouter = require('./routes/user-settings')
const authController = require('./controllers/auth-controller')
const hsts = require('hsts')
const secure = require('express-force-https')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express()
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(compression())
app.use('/assets', express.static('assets'))
app.use('/tmp', express.static('tmp'))
app.use(cookieParser())
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
    credentials: true,
  })
)
app.use(secure)
app.use(hsts({ maxAge: 38880000, preload: true })) // 180 days in seconds * 2.5 (for over a year)

/////////////////////////////////////////
// Create /tmp if not exist
////////////////////////////////////////

// Gotta be a better way for this is j-server
const fs = require('fs')
const dir = './tmp'

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir)
}

/////////////////////////////////////////
// Routes
/////////////////////////////////////////

app.use('/api/monday', mondayRouter)
app.use('/api/hootsuite', hootsuiteRouter)
app.use('/monday', mondayIntegrationRouter)
app.use('/api/monday/user-settings', userSettingsRouter)

/////////////////////////
// Auth Routes from Integration
/////////////////////////

// MOVE TO HS ROUTES
app.get('/auth', authController.callback)

/////////////////////////////////////////
// DB
/////////////////////////////////////////
// DO NOT EVER RUN WITH FORCE: TRUE

// const db = require('./models')
// db.sequelize.sync({ alter: true }).then(() => {
//   console.log('DB Synced')
// })

console.log('NO SEQUELIZE SCHEMA SYNC')

/////////////////////////////////////////
// Report Error From Client Side
/////////////////////////////////////////
app.post(`/api/reportError`, (req, res) => {
  utils.reportError(req.body.errorMessage, req.body.error)
  res.send()
})

/////////////////////////////////////////
// Test routes
/////////////////////////////////////////

app.get('/api/testo', async (req, res) => {
  try {
    const videoSource =
      'https://videos.pexels.com/video-files/3209663/3209663-uhd_3840_2160_25fps.mp4'
    const ffprobe = require('ffprobe')
    const ffprobeStatic = require('ffprobe-static')

    const bufferFile = await utils.downloadImg(videoSource)
    const filename = `testo-${Date.now()}`
    const fullFilePath = await utils.writeFileToTmp({
      req,
      bufferFile,
      filename,
    })

    ffprobe(fullFilePath, { path: ffprobeStatic.path })
      .then(function (info) {
        console.log(info, info.streams[0].disposition, info.streams[0].tags)
      })
      .catch(function (err) {
        console.error(err)
      })

    res.send({ ok: true })
  } catch (catchError) {
    const errorMessage = `Could not testo`
    console.log({ req, errorMessage, catchError })
    res.send({ error: true })
  }
})

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Helloo From Express' })
})

app.post('/api/world', (req, res) => {
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`
  )
})

app.get('/error', (req, res, next) => {
  next(new Error('Something went wrong!'))
})

/////////////////////////////////////////
// Error handling
/////////////////////////////////////////
app.use((err, req, res, next) => {
  const errorMessage = `Internal Server Error`
  const catchError = `Error: ${err.message || errorMessage}`
  console.error() // Log error for debugging
  utils.reportError(errorMessage, { err, catchError })
  res.status(200).json({ errorMessage })
  next()
})

/////////////////////////////////////////
// NO ENDPOINTS BEYOND THIS POINT
/////////////////////////////////////////
if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')))

  app.post('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'))
  })

  // Handle React routing, return all requests to React app
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'))
  })
} else {
  console.log(
    `Needs "ygrok" for front end view.  Needs "ygrokserver" for Main Table Triggers.`
  )
}

http.createServer(app).listen(process.env.PORT || 5000)
console.log(`Example app listening on port ${process.env.PORT || 5000}`)
