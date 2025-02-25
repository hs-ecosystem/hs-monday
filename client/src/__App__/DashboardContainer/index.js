import { connect } from 'react-redux'
import { store } from '../..'
import { setItems } from '../../j-comps'
import mondaySdk from 'monday-sdk-js'
import { useEffect } from 'react'
import Dashboard from '../Dashboard'

const mondayInstance = mondaySdk()

const DashboardContainer = (props) => {
  const { mondayColorMode, mondayId, mondayData } = props

  useEffect(() => {
    setItems({ store, resource: 'monday', items: mondayInstance })
    if (!mondayData) {
      mondayInstance.get('context').then(async ({ data }) => {
        await setItems({ resource: 'mondayData', items: data })
        await setItems({ resource: 'mondayColorMode', items: data.theme })
        const mondayId = data.user.id
        await setItems({ resource: 'mondayId', items: mondayId })
      })
    }
  }, [mondayData])
  return (
    <>{mondayColorMode && mondayId && mondayData ? <Dashboard /> : undefined}</>
  )
}

const mapStateToProps = (state) => ({
  mondayColorMode: state.mondayColorMode,
  mondayId: state.mondayId,
  mondayData: state.mondayData,
})

export default connect(mapStateToProps)(DashboardContainer)
