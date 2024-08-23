import styled from 'styled-components'
import { ExternalLink } from '../../../../../../j-comps'

const Container = styled.div``

const WizardStepC = () => {
  return (
    <Container>
      <div style={{ fontWeight: 'bold' }}>
        Stale monday.com dashboard sessions
      </div>
      <div>
        After a period of inactivity, the monday.com dashboard may become stale.
        If the integration is not working, first refresh the browser. Try this
        once as it is the quickest possible solution, if that doesn't help, take
        a look at the troubleshooting video on the{' '}
        <ExternalLink
          href={
            'https://jmoneyapps.com/monday/user-guide/hootsuite#known-limitations'
          }
          underline={'true'}
        >
          User Guide
        </ExternalLink>
        .
      </div>
    </Container>
  )
}

export default WizardStepC
