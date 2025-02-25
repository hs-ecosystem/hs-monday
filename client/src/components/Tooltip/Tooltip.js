import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'

const useStyles = makeStyles((theme) => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
    padding: '10px',
    fontSize: '14px',
  },
}))

function BootstrapTooltip(props) {
  const classes = useStyles()

  return <Tooltip arrow classes={classes} {...props} />
}

const CustomizedTooltip = ({ title, children }) => {
  return <BootstrapTooltip title={title}>{children}</BootstrapTooltip>
}

export { CustomizedTooltip as Tooltip }
