import { connect } from 'react-redux'
import styled from 'styled-components'
import WizardBody from './WizardBody'
import { getUserSettings } from '../../../../data/actions'
import { useEffect } from 'react'
import React from 'react'
import { setItems } from '../../../../j-comps'

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: sans-serif;
`

const SubContainer = styled.div`
  border: 1px solid lightgrey;
  padding: 10px;
  background-color: white;
  margin-top: 20px;
  border-radius: 5px;
`

const WizardHeaderContainer = styled.div`
  padding: 20px;
  text-align: center;
`

const WizardHeader = styled.div`
  font-weight: bold;
  font-size: 20px;
`

const WizardSubHeader = styled.div`
  font-weight: bold;
  font-size: 16px;
  color: grey;
`

const WizardGuide = ({ monday, mondayId, hootsuiteUid, boardId }) => {
  const [showContainer, setShowContainer] = React.useState(false)
  useEffect(() => {
    if ((monday, mondayId, hootsuiteUid, boardId)) {
      getUserSettings({ monday, mondayId, hootsuiteUid, boardId }).then(
        (data) => {
          if (!data?.hasViewedWizard) {
            setShowContainer(true)
          } else {
            setItems({ resource: 'dashboardView', items: 'field-mapper' })
          }
        }
      )
    }
  }, [monday, mondayId, hootsuiteUid, boardId])
  return (
    <Container>
      {showContainer && (
        <SubContainer>
          <WizardHeaderContainer>
            <WizardHeader>
              Welcome to the Hootsuite for monday.com integration
            </WizardHeader>
            <WizardSubHeader>Before you start</WizardSubHeader>
          </WizardHeaderContainer>
          <WizardBody />
        </SubContainer>
      )}
    </Container>
  )
}

const mapStateToProps = (state) => ({
  monday: state.monday,
  mondayId: state.mondayId,
  hootsuiteUid: state.hootsuiteUid,
  boardId: state.boardId,
})

export default connect(mapStateToProps)(WizardGuide)
