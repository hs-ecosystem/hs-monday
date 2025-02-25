import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  overflow-y: auto;
  flex: 1 1 auto;
  height: ${(p) => (p.appType === 'plugin' ? '326px' : undefined)};
`

const FlexContainer = (props) => {
  const { children } = props
  return <Container {...props}>{children}</Container>
}

export { FlexContainer }
