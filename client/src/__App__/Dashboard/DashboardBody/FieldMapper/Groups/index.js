import { setItems } from '../../../../../j-comps'
import { useEffect } from 'react'
import { connect } from 'react-redux'
import { store } from '../../../../..'
import config from '../../../../../config'
import GroupIcon from 'monday-ui-react-core/dist/icons/Group'
import styled from 'styled-components'
import { getUserSettings, setUserSetting } from '../../../../../data/actions'
import { GroupsDropdown } from './GroupsDropdown'
import { makeStyles } from '@material-ui/core'

const Container = styled.div`
  margin: 20px 0px;
`

const LabelText = styled.span`
  color: ${(p) => p.color};
  &:hover {
    color: white;
  }
`

const HelperTextContainer = styled.div`
  display: flex;
  align-items: center;
  display: center;
  color: grey;
`

const GroupsContainer = ({
  monday,
  mondayId,
  hootsuiteUid,
  groups,
  group,
  boardId,
}) => {
  useEffect(() => {
    async function setGroups() {
      if (groups && groups.length) {
        const userSettings = await getUserSettings({
          monday,
          mondayId,
          hootsuiteUid,
          boardId,
        })
        const maybeGroup = groups.find((s) => s.id === userSettings?.groupId)
        const group = maybeGroup ? maybeGroup : groups[0]
        setItems({ store, resource: 'group', items: group })
        setItems({ store, resource: 'groupId', items: group.id })
        setUserSetting({
          monday,
          mondayId,
          setting: { key: 'groupId', value: group.id },
          boardId,
        })
      }
    }
    setGroups()
  }, [monday, mondayId, hootsuiteUid, groups, boardId])
  return (
    <Groups
      monday={monday}
      groups={groups}
      group={group}
      mondayId={mondayId}
      boardId={boardId}
    />
  )
}

const useStyles = makeStyles((theme) => ({
  root: {
    color: theme.color,
  },
}))

const Groups = ({ monday, mondayId, groups, group, boardId }) => {
  const dropdownButtonText = group ? (
    <span style={{ color: group?.color }}>{group.text}</span>
  ) : (
    'Groups'
  )
  const firstItem = { text: 'Groups' }
  const middleItems =
    groups && groups.length
      ? groups.map((group) => ({
          id: group.id,
          text: <LabelText color={group.color}>{group.text}</LabelText>,
          onClick: () => {
            setItems({ store, resource: 'group', items: group })
            setItems({ store, resource: 'groupId', items: group.id })
            setUserSetting({
              monday,
              mondayId,
              setting: { key: 'groupId', value: group.id },
              boardId,
            })
          },
        }))
      : null

  const classes = useStyles()
  return (
    <div>
      <HelperTextContainer className={classes.root}>
        Select the monday.com group to import and sync Hootsuite messages
      </HelperTextContainer>
      <Container>
        <GroupsDropdown
          dropdownButton={{
            text: dropdownButtonText,
            icon: <GroupIcon style={{ color: group?.color }} />,
          }}
          appName={config.app}
          firstItem={firstItem}
          middleItems={middleItems}
        />
      </Container>
    </div>
  )
}

const mapStateToProps = (state) => ({
  monday: state.monday,
  groups: state.groups,
  group: state.group,
  mondayId: state.mondayId,
  hootsuiteUid: state.hootsuiteUid,
  boardId: state.boardId,
})

export default connect(mapStateToProps)(GroupsContainer)
