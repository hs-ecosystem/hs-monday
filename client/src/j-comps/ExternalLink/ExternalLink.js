import styled from 'styled-components'

const StyledLink = styled.a`
  text-decoration: ${(p) => (p.underline ? 'underline' : 'none')};
  color: ${(p) => (p.color ? p.color : 'black')};
  &:hover {
    text-decoration: ${(p) => (p.hoverUnderline ? 'underline' : 'inherit')};
  }
`

const ExternalLink = ({
  href,
  color,
  underline,
  hoverUnderline,
  parentTarget,
  children,
}) => {
  return (
    <StyledLink
      href={href}
      target={parentTarget ? '_parent' : '_blank'}
      rel={'noopener'}
      color={color}
      underline={underline}
      hoverUnderline={hoverUnderline}
    >
      {children}
    </StyledLink>
  )
}

export { ExternalLink }
