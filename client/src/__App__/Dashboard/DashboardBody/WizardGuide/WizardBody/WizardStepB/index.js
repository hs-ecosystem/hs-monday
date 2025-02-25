import styled from 'styled-components'

const Container = styled.div``

const WizardImg = styled.img`
  border-radius: 5px;
  margin: 10px 0;
  border: 1px solid lightgrey;
  padding: 5px;
`

const WizardStepB = () => {
  return (
    <Container>
      <div style={{ fontWeight: 'bold' }}>
        Using the Main Table with the integration
      </div>
      <div>
        When using the Main Table tab, the only way for the app to communicate
        with you is through the monday.com item's Updates. Click the Add to
        converstion button to pull up the expanded view of the item and look for
        any error communication or messages from the integration.
      </div>
      <div>
        <WizardImg
          src={
            'https://jmoneyapps.com/images/monday/apps/hootsuite/mn-hootsuite-add-to-conversation.png'
          }
          alt={'add to conversation'}
        />
      </div>
    </Container>
  )
}

export default WizardStepB
