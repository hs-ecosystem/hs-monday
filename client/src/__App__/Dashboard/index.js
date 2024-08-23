import { useEffect } from 'react'
import config from '../../config'
import { useNavigate } from 'react-router-dom'
import StreamHeader from './DashboardHeader'
import {
  ViewContainer,
  FlexContainer,
  ErrorBoundary,
  clearError,
  setItems,
  postItems,
  getItems,
} from '../../j-comps'
import DashboardBody from './DashboardBody'
import { connect } from 'react-redux'
import { store } from '../../index'
import { Helmet } from 'react-helmet'

import {
  getHootsuiteUid,
  getMondayBoard,
  getMondayColumns,
  getMondayGroups,
  loadSavedFields,
} from '../../data/actions/monday'
import { checkHootsuiteOauth, checkMondayOauth } from '../../utils'

import LinearProgress from '@material-ui/core/LinearProgress'
import { makeStyles } from '@material-ui/core'
import { createUserSettings } from '../../data/actions'

const useStyles = makeStyles(() => ({
  root: {
    height: '9px',
  },
}))

const Dashboard = (props) => {
  const navigate = useNavigate()
  const {
    errorMessage,
    monday,
    isLoading,
    mondayColorMode,
    mondayId,
    mondayData,
  } = props

  useEffect(() => {
    const startFunction = async ({ monday, mondayId }) => {
      postItems({
        monday,
        namespace: 'hootsuite',
        resource: 'social-profiles',
        action: 'get-all',
        bodyData: { mondayId },
      }).then(async ({ data }) => {
        const filteredProfiles = data?.profiles
          ? data.profiles.filter(
              (p) =>
                p.type !== 'INSTAGRAM' && // Can't publish to IG Personal, only schedule to HS.
                // p.type !== 'LINKEDIN' &&
                p.type !== 'PINTEREST' &&
                p.type !== 'FACEBOOK'
            )
          : []
        const hydratePromises = await filteredProfiles.map(async (p) => {
          if (p.type === 'TWITTER') {
            const hydratedProfile = await postItems({
              monday,
              namespace: 'hootsuite',
              resource: 'twitter',
              action: 'profile-hydrate',
              bodyData: { socialNetworkId: p.socialNetworkId },
            })

            return {
              ...p,
              ...hydratedProfile.data,
              id: p.id,
            }
          } else {
            return p
          }
        })
        const items = await Promise.all(hydratePromises)
        setItems({ resource: 'isLoadingSocialProfiles', items: false })
        setItems({ resource: 'socialProfiles', items })
      })
    }

    const mondayStartFunction = async ({
      monday,
      hootsuiteUid,
      mondayData,
      mondayId,
    }) => {
      getItems({
        monday,
        namespace: 'monday',
        resource: 'me',
        bodyData: {
          hootsuiteUid,
          mondayId,
        },
      })
      const board = await getMondayBoard({
        monday,
        mondayData,
        hootsuiteUid,
        mondayId,
      })
      if (board) {
        getMondayGroups({ monday, boardId: board?.id })
        getMondayColumns({ monday, boardId: board?.id })

        const hasFields = await loadSavedFields({
          monday,
          mondayId,
          hootsuiteUid,
          boardId: board?.id,
        })
        if (!hasFields && monday) {
          await createUserSettings({
            monday,
            mondayId,
            hootsuiteUid,
            boardId: board.id,
          })
        }
      }
    }

    const runDash = async () => {
      const hootsuiteUid = await getHootsuiteUid({
        monday,
        navigate,
        mondayId,
      })
      if (hootsuiteUid && mondayColorMode) {
        await checkHootsuiteOauth({
          navigate,
          startFunction,
          monday,
          mondayData,
          mondayId,
          hootsuiteUid,
        })
        await checkMondayOauth({
          navigate,
          startFunction: mondayStartFunction,
          monday,
          mondayData,
          hootsuiteUid,
          mondayId,
        })
      }
    }
    runDash()
  }, [monday, navigate, props, mondayColorMode, mondayId, mondayData])

  const handleErrorClick = () => {
    clearError({ store })
  }

  const classes = useStyles()

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {mondayColorMode && (
        <ViewContainer appName={config.app} type={'content'}>
          {isLoading && <LinearProgress className={classes.root} />}
          <Helmet>
            <title>{config.titleAppName}</title>
          </Helmet>
          <StreamHeader />
          <FlexContainer>
            <ErrorBoundary
              errorMessage={errorMessage}
              onClick={handleErrorClick}
            >
              <DashboardBody />
            </ErrorBoundary>
          </FlexContainer>
        </ViewContainer>
      )}
    </div>
  )
}

const mapStateToProps = (state) => ({
  errorMessage: state.errorMessage,
  isLoading: state.isLoading,
  monday: state.monday,
  mondayColorMode: state.mondayColorMode,
  mondayId: state.mondayId,
  mondayData: state.mondayData,
})

export default connect(mapStateToProps)(Dashboard)
