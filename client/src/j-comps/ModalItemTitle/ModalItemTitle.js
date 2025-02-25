import TextField from '@material-ui/core/TextField'
import { setItems } from '../data/actions/items'
import styled from 'styled-components'

const Container = styled.div`
  font-variant: none;
  width: ${(p) => p.width};
  margin: ${(p) => p.margin};
`

const ModalItemTitle = ({
  store,
  itemTitle,
  label = 'Task Title',
  size = 'small',
  variant = 'outlined',
  width = '410px',
  margin = '10px',
}) => {
  const handleChange = (e) => {
    setItems({ store, resource: 'itemTitle', items: e.target.value })
  }

  return (
    <Container width={width} margin={margin}>
      <TextField
        size={size}
        id={'modal-title-input'}
        label={label}
        variant={variant}
        fullWidth
        value={itemTitle}
        onChange={handleChange}
      />
    </Container>
  )
}

export { ModalItemTitle }
