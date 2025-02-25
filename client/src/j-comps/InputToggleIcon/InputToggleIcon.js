import { Checkbox } from '../Checkbox/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Favorite from '@material-ui/icons/Favorite'
import FavoriteBorder from '@material-ui/icons/FavoriteBorder'

const InputToggleIcon = () => {
  return (
    <FormControlLabel
      control={
        <Checkbox
          icon={<FavoriteBorder />}
          checkedIcon={<Favorite />}
          value={'checkedH'}
          title={'Star Item'}
        />
      }
    />
  )
}

export { InputToggleIcon }
