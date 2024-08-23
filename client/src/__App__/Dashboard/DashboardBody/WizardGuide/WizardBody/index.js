import React from 'react'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import WizardStepA from './WizardStepA'
import WizardStepB from './WizardStepB'
import WizardStepC from './WizardStepC'
import styled from 'styled-components'
import { useEffect } from 'react'
import { setItems } from '../../../../../j-comps'
import WizardStepD from './WizardStepD'
import { setUserSetting } from '../../../../../data/actions'
import { connect } from 'react-redux'

const Container = styled.div`
  width: 750px;
`

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const getStepNames = () => {
  return [
    'Known Limitations',
    'Main Table',
    'Stale sessions',
    'Custom Triggers',
  ]
}

const getStepContent = (stepIndex) => {
  switch (stepIndex) {
    case 0:
      return <WizardStepA />
    case 1:
      return <WizardStepB />
    case 2:
      return <WizardStepC />
    case 3:
      return <WizardStepD />
    default:
      return ''
  }
}

const WizardBody = ({ monday, mondayId, boardId }) => {
  const [activeStep, setActiveStep] = React.useState(0)
  const steps = getStepNames()

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
  }

  useEffect(() => {
    if (activeStep === steps.length) {
      setItems({ resource: 'dashboardView', items: 'field-mapper' })
      setUserSetting({
        monday,
        mondayId,
        setting: { key: 'hasViewedWizard', value: 'yes' },
        boardId,
      })
    }
  }, [activeStep, steps, monday, mondayId, boardId])

  return (
    <Container>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div>
        {activeStep === steps.length ? (
          <div>
            <Typography sx={{ margin: '10px 0' }}>Go to app</Typography>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        ) : (
          <div>
            <div style={{ margin: '10px 0', padding: '10px' }}>
              {getStepContent(activeStep)}
            </div>
            <ButtonContainer>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                style={{ margin: '10px' }}
              >
                Back
              </Button>
              <Button
                style={{ margin: '10px' }}
                variant={'outlined'}
                onClick={handleNext}
              >
                {activeStep === steps.length - 1 ? 'Go to app' : 'Next'}
              </Button>
            </ButtonContainer>
          </div>
        )}
      </div>
    </Container>
  )
}

const mapStateToProps = (state) => ({
  monday: state.monday,
  mondayId: state.mondayId,
  boardId: state.boardId,
})

export default connect(mapStateToProps)(WizardBody)
