import { TextField } from '@material-ui/core'
import { theme } from '../../j-comps'
import { makeStyles } from '@material-ui/core/styles'
import config from '../../config'

const useStyles = makeStyles({
  root: {
    width: (p) => p.width,
    margin: (p) => p.margin,
    '& label.Mui-focused': {
      color: theme.color[config.app].primary,
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: theme.color[config.app].primary,
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: theme.color[config.app].primary,
      },
      '&:hover fieldset': {
        borderColor: theme.color[config.app].primary,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.color[config.app].primary,
      },
    },
  },
})

const StyledTextField = (props) => {
  const { root } = useStyles(props)
  return <TextField className={root} {...props} />
}

export { StyledTextField }
