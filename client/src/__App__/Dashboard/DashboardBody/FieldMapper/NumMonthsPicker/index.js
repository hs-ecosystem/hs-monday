import { connect } from 'react-redux'
import config from '../../../../../config'
import { setItems, theme } from '../../../../../j-comps'
import styled from 'styled-components'
import { useEffect } from 'react'
import {
  getUserSettings,
  setUserSetting,
} from '../../../../../data/actions/index'
import TimeIcon from 'monday-ui-react-core/dist/icons/Time'
import { NumMonthsDropdown } from './NumMonthsDropdown'
import { Tooltip } from '../../../../../components/Tooltip/Tooltip'

const Container = styled.div`
  margin-right: 20px;
`

const NumMonthsPicker = ({
  monday,
  numMonths,
  mondayId,
  hootsuiteUid,
  boardId,
}) => {
  useEffect(() => {
    async function fetchUserSettings() {
      const settingsData = await getUserSettings({ monday, mondayId, boardId })
      if (settingsData?.numMonthsToImport) {
        setItems({
          resource: 'numMonths',
          items: settingsData.numMonthsToImport,
        })
      }
    }
    if (mondayId) fetchUserSettings()
  }, [monday, mondayId, boardId])
  const dropdownButtonText = numMonths
    ? `${numMonths} Month${numMonths > 1 ? 's' : ''}`
    : 'Num Months'
  const firstItem = { text: 'Number of Months to Import' }
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  const middleItems = months.map((n) => ({
    id: n,
    text: n,
    onClick: () => {
      setUserSetting({
        monday,
        mondayId,
        hootsuiteUid,
        setting: { key: 'numMonthsToImport', value: n },
        boardId,
      })
      setItems({ resource: 'numMonths', items: n })
    },
  }))

  return (
    <Tooltip
      title={
        'Set the number of months from now for the integration to sync Hootsuite messages and click the Sync Now button'
      }
    >
      <Container>
        <NumMonthsDropdown
          dropdownButton={{
            text: dropdownButtonText,
            icon: <TimeIcon style={{ color: theme.color.monday.primary }} />,
          }}
          appName={config.app}
          firstItem={firstItem}
          middleItems={middleItems}
        />
      </Container>
    </Tooltip>
  )
}

const mapStateToProps = (state) => ({
  monday: state.monday,
  numMonths: state.numMonths,
  mondayId: state.mondayId,
  hootsuiteUid: state.hootsuiteUid,
  boardId: state.boardId,
})

export default connect(mapStateToProps)(NumMonthsPicker)
