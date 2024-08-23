import React from 'react'
import Badge from '@material-ui/core/Badge'
import Avatar from '@material-ui/core/Avatar'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { Tooltip } from '@material-ui/core'

const StyledBadge = withStyles(() => ({
  badge: {
    color: '#44b700',
  },
}))(Badge)

const SmallAvatar = withStyles((theme) => ({
  root: {
    width: 18,
    height: 18,
    border: `2px solid ${theme.palette.background.paper}`,
  },
}))(Avatar)

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}))

const BadgeAvatars = ({ src, alt, icon, socialNetwork }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <StyledBadge
        overlap={'circular'}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        badgeContent={
          <Tooltip title={socialNetwork || 'Social Network'}>
            <SmallAvatar alt={socialNetwork} src={icon} />
          </Tooltip>
        }
      >
        <Avatar alt={alt} src={src} />
      </StyledBadge>
    </div>
  )
}

export { BadgeAvatars }
