import { addSeconds, format } from 'date-fns'

export const convertDistance = (me, item) => {
  if (me && item) {
    if (me.measurement_preference) {
      if (me.measurement_preference === 'meters') {
        return (item.distance / 1000).toFixed(2)
      } else if (me.measurement_preference === 'feet') {
        return (item.distance / 5280).toFixed(2)
      }
    } else {
      return 0
    }
  } else {
    return 0
  }
}

export const convertType = (me) => {
  if (me) {
    if (me.measurement_preference) {
      if (me.measurement_preference === 'meters') {
        return 'km'
      } else if (me.measurement_preference === 'feet') {
        return 'mile'
      } else {
        return 'mile'
      }
    }
  } else {
    return 'mile'
  }
}

export const convertTime = (seconds) => {
  if (seconds) {
    const helperDate = addSeconds(new Date(0), seconds)
    const minsAndSecs = format(helperDate, 'm:ss')
    const MILLISECONDS_IN_HOUR = 3600000
    const hours = Math.floor((seconds * 1000) / MILLISECONDS_IN_HOUR)
    return hours ? `${hours}:${minsAndSecs}` : minsAndSecs
  } else {
    return '0:00'
  }
}

export const calculatePace = (type = 'km', distance, time) => {
  const totalMinutes = time / 60
  const milesOrKms = type === 'km' ? distance / 1000 : distance / 5280
  const pace = totalMinutes / milesOrKms
  const paceMinutes = Math.floor(pace)
  let paceSeconds = Math.round((pace - paceMinutes) * 60)

  if (paceSeconds < 10) {
    paceSeconds = '0' + paceSeconds
  }
  return `${paceMinutes}:${paceSeconds}`
}

export const convertAvgTimePerDistance = (me, item) => {
  if (me && item) {
    const pace = calculatePace(convertType(me), item.distance, item.moving_time)
    return `${pace} /${convertType(me)}`
  } else {
    return `0:00`
  }
}

export const getActivityIconUrl = (type) => {
  switch (type) {
    case 'Ride':
      return '/assets/img/bike-icon.png'
    case 'Run':
      return '/assets/img/run-icon.png'
    case 'Workout':
      return '/assets/img/workout-icon.png'
    case 'Alpine Ski':
      return '/assets/img/alpine-ski-icon.png'
    case 'Hike':
      return '/assets/img/hike-icon.png'
    default:
      return '/assets/img/butterfly-icon.png'
  }
}
