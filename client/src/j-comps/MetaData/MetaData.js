import styled from 'styled-components'

const Container = styled.p`
  margin: 0;
  font-variant: ${(p) => (p.allSmallCaps ? 'all-small-caps' : null)};
  color: ${(p) => p.color};
`

const Dot = styled.span`
  color: ${(p) => (p.dotColor ? p.dotColor : 'black')};
  font-weight: bold;
`
const MetaData = ({ details, allSmallCaps, color, dotColor }) => {
  return (
    <Container allSmallCaps={allSmallCaps} color={color}>
      {details &&
        details.map((detail, i) => (
          <span key={i}>
            <span>{detail}</span>
            {details.length > 1 && i !== details.length - 1 ? (
              <Dot dotColor={dotColor}>{' · '}</Dot>
            ) : null}
          </span>
        ))}
    </Container>
  )
}

export { MetaData }
