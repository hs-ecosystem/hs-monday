import { reportError, postItems } from '../../j-comps'
import { add, formatISO } from 'date-fns'

///////////////////////////
// Hootsuite
//////////////////////////
const getSocialProfile = ({ monday, mondayId, id }) => {
  try {
    return postItems({
      monday,
      namespace: 'hootsuite',
      resource: 'social-profiles',
      action: 'get',
      bodyData: {
        mondayId,
        id,
      },
    }).then(({ data }) => {
      return data
    })
  } catch (catchError) {
    const errorMessage = `Could not get Hootsuite Social Profile.`
    reportError(errorMessage, catchError)
  }
}

const hydrateTwitterProfile = async ({ monday, socialNetworkId }) => {
  try {
    const hydratedMessageRes = await postItems({
      monday,
      namespace: 'hootsuite',
      resource: 'twitter',
      action: 'profile-hydrate',
      bodyData: { socialNetworkId },
    })

    return hydratedMessageRes.data
  } catch (catchError) {
    const errorMessage = `Could not Hydrate Twitter Hootsuite Message.`
    reportError(errorMessage, catchError)
  }
}

const getOneMonthMessages = async ({ monday, start, mondayId }) => {
  try {
    const startTime = encodeURIComponent(
      formatISO(add(new Date(), { days: start * 30 }))
    )
    const endTime = encodeURIComponent(
      formatISO(add(new Date(), { days: (start + 1) * 30 }))
    )

    return await postItems({
      monday,
      namespace: 'hootsuite',
      resource: 'messages',
      action: 'scheduled',
      bodyData: {
        mondayId,
        startTime,
        endTime,
      },
    }).then(async ({ data }) => {
      const messagePromises = data.messages
        ? await data.messages.map(async (m) => {
            const profileRes = await getSocialProfile({
              monday,
              mondayId,
              id: m.socialProfile.id,
            })

            if (profileRes.profile.type === 'TWITTER') {
              const { profile } = profileRes
              const { socialNetworkId } = profile
              const t = await hydrateTwitterProfile({ monday, socialNetworkId })
              return { ...m, profile: { ...profileRes.profile, ...t } }
            }
            return { ...m, ...profileRes }
          })
        : data.messages

      return Promise.all(messagePromises)
        .then((newMessages) => {
          const filteredMessages = newMessages.filter(
            (m) => m.profile.type !== 'INSTAGRAM' // Can't publish to IG Personal, only schedule message.
          )
          return filteredMessages
        })
        .catch((promiseError) => {
          const errorMessage = `Could not get Hootsuite Social Profile data`
          reportError(errorMessage, promiseError)
        })
    })
  } catch (catchError) {
    const errorMessage = `Could not get Hootsuite Messages For One Month.`
    reportError(errorMessage, catchError, true)
  }
}

export const getScheduledMessages = async ({
  monday,
  mondayId,
  numMonths = 1,
}) => {
  try {
    const allMessagesPromise = Array(numMonths)
      .fill()
      .map((_, i) => {
        return getOneMonthMessages({
          monday,
          mondayId,
          numMonths,
          start: i,
        })
      })

    return Promise.all(allMessagesPromise).then((data) => {
      return data.flat()
    })
  } catch (catchError) {
    const errorMessage = `Could not get Hootsuite Scheduled Messages.`
    reportError(errorMessage, catchError)
  }
}
