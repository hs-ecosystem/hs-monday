import { Dropdown, getItems, setItems } from '../../../../../j-comps'
import { connect } from 'react-redux'
import { store } from '../../../../..'
import config from '../../../../../config'
import DashboardIcon from '@material-ui/icons/Dashboard'
import styled from 'styled-components'

const Container = styled.div`
  margin-right: 20px;
`

const Boards = ({ monday, boards, board, mondayAt }) => {
  const dropdownButtonText = board ? board.name : 'Boards'
  const firstItem = { text: 'Boards' }
  const middleItems =
    boards && boards.length
      ? boards.map((board) => ({
          id: board.id,
          text: board.name,
          onClick: () => {
            setItems({ store, resource: 'board', items: board })
            getItems({
              monday,
              namespace: 'monday',
              resource: 'groups',
              bodyData: { at: mondayAt, board: board.id },
            })
            getItems({
              monday,
              namespace: 'monday',
              resource: 'columns',
              bodyData: { at: mondayAt, board: board.id },
            })
          },
        }))
      : null
  return (
    <Container>
      <Dropdown
        dropdownButton={{ text: dropdownButtonText, icon: <DashboardIcon /> }}
        appName={config.app}
        firstItem={firstItem}
        middleItems={middleItems}
      />
    </Container>
  )
}

const mapStateToProps = (state) => ({
  monday: state.monday,
  boards: state.boards,
  board: state.board,
  mondayAt: state.mondayAt,
})

export default connect(mapStateToProps)(Boards)
