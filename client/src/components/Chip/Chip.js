import { Chip } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import { theme } from '../../j-comps'

const CustomizedChip = (props) => {
  return (
    <Chip
      {...props}
      deleteIcon={
        <CloseIcon
          size={'small'}
          style={{ height: '45%', color: theme.color.monday.primary }}
        />
      }
    />
  )
}

export { CustomizedChip as Chip }
