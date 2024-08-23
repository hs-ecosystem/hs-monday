const Rollbar = require('rollbar')
const fetch = require('node-fetch')
const { format, utcToZonedTime } = require('date-fns-tz')
const fs = require('fs')
const {
  HOOTSUITE_IMAGE_RESTRICTIONS,
  HOOTSUITE_VIDEO_RESTRICTIONS,
} = require('../constants/hootsuite')

const isProd = process.env.NODE_ENV === 'production'

const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_KEY,
  captureUncaught: isProd,
  captureUnhandledRejections: isProd,
})

const convertToString = (message) => {
  const errorString = isFunction(message)
    ? message.toString
    : isObject(message)
    ? JSON.stringify(message)
    : message
  return errorString
}

const reportError = (errorMessage, error) => {
  console.log(errorMessage, error)
  if (isProd) {
    const errorString = isFunction(error)
      ? error.toString
      : isObject(error)
      ? JSON.stringify(error)
      : error
    const fullError = `${errorMessage}\n${errorString}`
    rollbar.error(fullError)
  }
  return
}

const downloadImg = async (url) => {
  const response = await fetch(url)
  const buffer = await response.buffer()
  return buffer
}

const formatInTimeZone = (date, fmt, tz, toUtc = false) => {
  try {
    if (toUtc) {
      const convertedTimestamp = utcToZonedTime(date, 'Etc/UTC')
      const a = format(convertedTimestamp, fmt, { timeZone: 'Etc/UTC' })
      return a
    } else {
      return format(utcToZonedTime(date, tz), fmt, { timeZone: tz })
    }
  } catch (catchError) {
    const errorMessage = `Could not format in timezone.`
    reportError(errorMessage, catchError)
  }
}

const getTimestamp = ({ tz = 'UTC' }) => {
  try {
    const formattedTimestamp = formatInTimeZone(
      Date.now(),
      'MMM d, yyyy h:mm a',
      tz
    )
    return formattedTimestamp
  } catch (catchError) {
    const errorMessage = `Could not get timestamp.`
    reportError(errorMessage, catchError)
  }
}

const isValidJSON = (str) => {
  try {
    JSON.parse(str)
    return true
  } catch (e) {
    return false
  }
}

const equalsIgnoreOrder = (a, b) => {
  try {
    if (a.length !== b.length) return false
    const uniqueValues = new Set([...a, ...b])
    for (const v of uniqueValues) {
      const aCount = a.filter((e) => e === v).length
      const bCount = b.filter((e) => e === v).length
      if (aCount !== bCount) return false
    }
    return true
  } catch (catchError) {
    const errorMessage = `Could not compare two arrays a: ${a} | b: ${b}`
    reportError(errorMessage, catchError)
  }
}

const shortenAWSMediaIds = ({ idArray, chars = 96 }) => {
  try {
    if (idArray && idArray.length) {
      const shortenedMediaIdsArray = idArray.map((m) => {
        if (m.length > chars) {
          return m.substr(0, chars)
        }
        return m
      })
      return shortenedMediaIdsArray
    }
    return idArray
  } catch (catchError) {
    const errorMessage = `Could not shorten AWS media IDs`
    reportError(errorMessage, catchError)
  }
}

const bytesToMb = (bytes) => {
  try {
    if (bytes) {
      const mb = Math.floor(bytes / 1000000)
      return `${mb} MB`
    }
    return `0 MB`
  } catch (catchError) {
    const errorMessage = `Could not convert bytes to MB`
    reportError(errorMessage, catchError)
  }
}

const isObject = (obj) => {
  try {
    return Object.prototype.toString.call(obj) === '[object Object]'
  } catch (catchError) {
    const errorMessage = `Could not check if is object`
    reportError(errorMessage, catchError)
    return false
  }
}

const isFunction = (func) => {
  try {
    return func instanceof Function
  } catch (catchError) {
    const errorMessage = `Could not check is is function`
    reportError(errorMessage, catchError)
  }
}

const writeFileToTmp = async ({ bufferFile, filename, ext }) => {
  try {
    const fullFileName = `${filename}.${ext}`
    const filepath = `tmp/${fullFileName}`
    fs.writeFileSync(filepath, bufferFile)
    return filepath
  } catch (catchError) {
    const errorMessage = `Could not write file (${filename}) to /tmp folder`
    reportError(errorMessage, catchError)
    return { error: true }
  }
}

const getMediaMetaData = async ({ imageBuffer, ext }) => {
  try {
    const ffprobe = require('ffprobe')
    const ffprobeStatic = require('ffprobe-static')

    // Write file to tmp for metadata
    const filename = `testo-${Date.now()}`
    const fullFilePath = await writeFileToTmp({
      bufferFile: imageBuffer,
      filename,
      ext,
    })
    const mediaMetaData = ffprobe(fullFilePath, {
      path: ffprobeStatic.path,
    })

    return mediaMetaData
  } catch (catchError) {
    const errorMessage = `Could not get video meta data.`
    reportError(errorMessage, catchError)
  }
}

const cleanMediaMetaData = ({ rawMediaMetaData, ext, mime, sizeBytes }) => {
  try {
    const sizeMbs = sizeBytes / 1000000
    const widthPixels = rawMediaMetaData?.streams?.find((m) => m.width)?.width
    const heightPixels = rawMediaMetaData?.streams?.find(
      (m) => m.height
    )?.height
    const aspectRatio =
      rawMediaMetaData?.streams?.find((m) => m.display_aspect_ratio)
        ?.display_aspect_ratio || null
    const generalMetaData = {
      ext,
      mime,
      sizeMbs,
      widthPixels,
      heightPixels,
      aspectRatio,
    }
    if (HOOTSUITE_VIDEO_RESTRICTIONS.supportedFileTypes.includes(ext)) {
      const durationString = rawMediaMetaData?.streams?.find(
        (m) => m.duration
      )?.duration
      const durationDecimals = parseInt(durationString)
      return {
        isVideo: true,
        ...generalMetaData,
        durationSecs: Math.round(durationDecimals),
      }
    } else if (HOOTSUITE_IMAGE_RESTRICTIONS.supportedFileTypes.includes(ext)) {
      return { isImage: true, ...generalMetaData }
    } else {
      return {
        error: true,
        errorMessage: `Unknown file type.`,
      }
    }
  } catch (catchError) {
    const errorMessage = `Could not clean up media meta data.`
    reportError(errorMessage, catchError)
  }
}

const debugMode = ({ hootsuiteUid, mondayId, m }) => {
  try {
    if (!hootsuiteUid && !mondayId) {
      reportError('Missing some ID', { hootsuiteUid, mondayId })
    }
    if (hootsuiteUid == '9625672' || mondayId == '21287035') {
      console.log(`== DEBUG ==\n\n${convertToString(m)}\n\n == DEBUG END ==`)
    }
  } catch (catchError) {
    const errorMessage = `Could not debug mode.`
    reportError(errorMessage, catchError)
  }
}

module.exports = {
  reportError,
  downloadImg,
  formatInTimeZone,
  getTimestamp,
  isValidJSON,
  equalsIgnoreOrder,
  shortenAWSMediaIds,
  bytesToMb,
  isObject,
  isFunction,
  writeFileToTmp,
  getMediaMetaData,
  cleanMediaMetaData,
  debugMode,
  convertToString,
}
