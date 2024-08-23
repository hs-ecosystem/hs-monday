import styled from 'styled-components'
import LabelImportantIcon from '@material-ui/icons/LabelImportant'
import { ExternalLink, theme } from '../../../../../../j-comps'

const Container = styled.div``

const BulletStepsContainer = styled.div`
  margin: 20px;
`

const BulletPoint = styled.div`
  display: flex;
  align-items: center;
`

const WizardStepA = () => {
  return (
    <Container>
      <div style={{ fontWeight: 'bold' }}>How to use the integration</div>
      <div>
        Click next to view these tips and tricks to help navigate and get the
        full use of the integration.
      </div>
      <BulletStepsContainer>
        <BulletPoint>
          <LabelImportantIcon
            style={{ marginRight: '10px', color: theme.color.monday.primary }}
          />
          Using the Main Table with the integration
        </BulletPoint>
        <BulletPoint>
          <LabelImportantIcon
            style={{ marginRight: '10px', color: theme.color.monday.primary }}
          />
          Stale monday.com sessions
        </BulletPoint>
        <BulletPoint>
          <LabelImportantIcon
            style={{ marginRight: '10px', color: theme.color.monday.primary }}
          />
          Custom Triggers
        </BulletPoint>
      </BulletStepsContainer>
      <div style={{ margin: '10px 0' }}>
        For more information on these tips, visit the{' '}
        <ExternalLink
          underline={'true'}
          href={
            'https://jmoneyapps.com/monday/user-guide/hootsuite#known-limitations'
          }
        >
          User Guide
        </ExternalLink>
        .
      </div>
    </Container>
  )
}

export default WizardStepA
