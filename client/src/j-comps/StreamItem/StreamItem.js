import styled from 'styled-components'

const Item = styled.div`
  padding: 10px;
  display: flex;
  align-items: center;
  border-top: 1px solid #eceff1;
  min-height: 76px;
  /* Space Between */
  justify-content: ${(p) => (p.spaceBetween ? `space-between` : null)};
  /* Whole Item */
  cursor: ${(p) => (p.onClick ? `pointer` : null)};
  &:hover {
    background: ${(p) => (p.noHover ? null : `#eceff1`)};
  }
`

const StreamItem = ({ onClick, spaceBetween, noHover, children }) => {
  return (
    <Item spaceBetween={spaceBetween} noHover={noHover} onClick={onClick}>
      {children}
    </Item>
  )
}

export { StreamItem }
