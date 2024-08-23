import styled from 'styled-components'

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  -webkit-box-pack: center;
  justify-content: center;
  align-items: flex-start;
`

const AppContainer = ({ children }) => <Container>{children}</Container>

export { AppContainer }
