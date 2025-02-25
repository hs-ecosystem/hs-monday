import { Dropdown, setItems } from '../../../../../j-comps'
import { useEffect } from 'react'
import { connect } from 'react-redux'
import { store } from '../../../../..'
import config from '../../../../../config'
import styled from 'styled-components'
import GroupIcon from 'monday-ui-react-core/dist/icons/Group'

const Container = styled.div`
  margin-right: 20px;
`

const GroupsContainer = ({ groups, group }) => {
  useEffect(() => {
    if (groups && groups.length) {
      setItems({ store, resource: 'group', items: groups[0] })
      setItems({ store, resource: 'groupId', items: groups[0].id })
    }
  }, [groups])
  return <Groups groups={groups} group={group} />
}

const Groups = ({ groups, group }) => {
  const dropdownButtonText = group ? group.text : 'Groups'
  const firstItem = { text: 'Groups' }
  const middleItems =
    groups && groups.length
      ? groups.map((group) => ({
          id: group.id,
          text: group.text,
          onClick: () => {
            setItems({ store, resource: 'group', items: group })
            setItems({ store, resource: 'groupId', items: group.id })
          },
        }))
      : null
  return (
    <Container>
      <Dropdown
        dropdownButton={{ text: dropdownButtonText, icon: <GroupIcon /> }}
        appName={config.app}
        firstItem={firstItem}
        middleItems={middleItems}
      />
    </Container>
  )
}

const mapStateToProps = (state) => ({
  groups: state.groups,
  group: state.group,
})

export default connect(mapStateToProps)(GroupsContainer)
