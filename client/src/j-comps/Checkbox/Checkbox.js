import Checkbox from '@material-ui/core/Checkbox'
import { useState } from 'react'

const CustomCheckbox = () => {
  const [state, setState] = useState({
    checkedA: true,
  })

  const handleChange = (name) => (event) => {
    setState({ ...state, [name]: event.target.checked })
  }

  return (
    <Checkbox
      checked={state.checkedA}
      onChange={handleChange('checkedA')}
      value="checkedA"
      color="primary"
      inputProps={{
        'aria-label': 'primary checkbox',
      }}
    />
  )
}

export { CustomCheckbox as Checkbox }
