import styled from 'styled-components'

const Container = styled.div``

const WizardImg = styled.img`
  max-width: 600px;
  border-radius: 5px;
  margin: 10px 0;
  border: 1px solid lightgrey;
  padding: 5px;
`

const WizardStepD = () => {
  return (
    <Container>
      <div>
        Navigate to the Hootsuite integrations's custom triggers setup and
        ensure they are enabled. Please remove and re-add them.
      </div>
      <WizardImg
        src={
          'https://jmoneyapps.com/images/monday/apps/hootsuite/mn-hootsuite-triggers.png'
        }
        alt={'custom triggers'}
      />
    </Container>
  )
}

export default WizardStepD
