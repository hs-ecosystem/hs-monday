import styled from 'styled-components'
import { ExternalLink } from '../ExternalLink/ExternalLink'
import { theme } from '../theme/index.js'

const Container = styled.div`
  background: ${(p) => (p.background ? p.background : 'lightgrey')};
  color: ${(p) => (p.color ? p.color : 'white')};
  padding: ${theme.spacing.medium};
`

const Title = styled.h2`
  margin: 0;
`

const StreamItemHeader = ({ background, color, title, href, children }) => (
  <Container background={background} color={color}>
    <Title>
      {href ? (
        <ExternalLink href={href} color={color} hoverUnderline>
          {title}
        </ExternalLink>
      ) : (
        <span>{title}</span>
      )}
    </Title>
    {children}
  </Container>
)

export { StreamItemHeader }
