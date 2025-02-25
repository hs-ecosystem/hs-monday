import { useEffect } from 'react'
import styled from 'styled-components'
import { store } from '../../../..'
import { connect } from 'react-redux'
import Boards from './Boards'
import Groups from './Groups'
import { getItems, setItems } from '../../../../j-comps'

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
`

const OauthGenericItems = ({ monday, boards, mondayAt }) => {
  useEffect(() => {
    if (boards && boards.length) {
      setItems({ store, resource: 'board', items: boards[0] })
      getItems({
        monday,
        namespace: 'monday',
        store,
        resource: 'groups',
        bodyData: { at: mondayAt, board: boards[0].id },
      })
      getItems({
        monday,
        namespace: 'monday',
        store,
        resource: 'columns',
        bodyData: { at: mondayAt, board: boards[0].id },
      })
    }
  }, [monday, boards, mondayAt])
  return (
    <Container>
      <Boards />
      <Groups />
    </Container>
  )
}

const mapStateToProps = (state) => ({
  monday: state.monday,
  boards: state.boards,
  mondayAt: state.mondayAt,
})

export default connect(mapStateToProps)(OauthGenericItems)
