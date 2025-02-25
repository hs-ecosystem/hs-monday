export const getParameterByName = (name) => {
  name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]')
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
    results = regex.exec(window.location.search)
  return results === null
    ? ''
    : decodeURIComponent(results[1].replace(/\+/g, ' '))
}

/**
 * Prepare data to be sent to Hootsuite Composer
 * @param {*} hsData
 */
export const prepareHsMessage = (hsData) => {
  if (hsData) {
    const profileName =
      hsData.network === 'TWITTER'
        ? `@${hsData.profileName}`
        : hsData.profileName
    const message =
      `${profileName}\n` +
      `${hsData.postTimestamp}\n\n` +
      `${hsData.postContent}\n\n` +
      `${hsData.postLink}`

    return message
  }
  return ''
}

export const sanitize = (string) => {
  if (!string) return
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  const reg = /[&<>"'/]/gi
  return string.replace(reg, (match) => map[match])
}
