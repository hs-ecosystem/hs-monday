import Button from '@material-ui/core/Button'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grow from '@material-ui/core/Grow'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper'
import { useState, useRef, Fragment } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { theme } from '../../j-comps/theme'
import { makeStyles } from '@material-ui/core/styles'

const DropdownList = styled(MenuList)`
  max-height: 600px;
  overflow: auto;
  margin: -10px;
`

const FirstMenuItem = styled.div`
  font-family: ${theme.font.stack};
  font-weight: bold;
  color: black;
  margin: 15px 25px;
`

const useStyles = makeStyles(() => ({
  lastItem: {
    backgroundColor: theme.color.monday.error,
    color: 'white',
    '&:hover': {
      backgroundColor: '#b73446',
    },
  },
  root: {
    border: 'none',
    '&:active': {
      backgroundColor: theme.color.monday.highlight,
    },
    '&:hover': {
      backgroundColor: theme.color.monday.highlight,
      borderColor: theme.color.monday.highlight,
    },
  },
  label: {
    '&:hover': {
      backgroundColor: theme.color.monday.primary,
      color: 'white',
    },
  },
}))

const ClosableMenuItem = ({ onClick, setOpen, isLastItem, children }) => {
  const { lastItem } = useStyles()
  const handleClick = () => {
    onClick()
    setOpen(false)
  }
  const classes = useStyles()
  return (
    <MenuItem
      className={isLastItem ? lastItem : classes.label}
      onClick={handleClick}
      style={{ margin: '5px 10px', borderRadius: '4px' }}
    >
      {children}
    </MenuItem>
  )
}

const FirstItem = ({ firstItem }) => {
  return (
    <FirstMenuItem
      classes={{ root: 'my-root-class' }}
      onClick={() => firstItem.onClick()}
    >
      {firstItem.text}
    </FirstMenuItem>
  )
}

const ExtLinks = ({ externalLinks, setOpen }) => {
  const handleClick = (href) => {
    setOpen(false)
    window.open(href)
  }
  const classes = useStyles()
  return (
    <>
      {externalLinks.map((item, i) => (
        <Fragment key={i}>
          <MenuItem
            className={classes.label}
            key={i}
            onClick={() => handleClick(item.href)}
            style={{ margin: '5px 10px', borderRadius: '4px' }}
          >
            {item.text}
          </MenuItem>
        </Fragment>
      ))}
    </>
  )
}

const MiddleItems = ({ middleItems, setOpen }) => {
  return (
    <>
      {middleItems.map((item, i) => (
        <ClosableMenuItem
          key={i}
          setOpen={setOpen}
          onClick={() => item.onClick()}
          isLastItem={item.isLastItem ? true : false}
        >
          {item.text}
        </ClosableMenuItem>
      ))}
    </>
  )
}

const ButtonContainer = styled.div`
  text-align: center;
`
const ButtonText = styled.div`
  color: ${(p) => (p.color ? p.color : theme.color[p.appName].primary)};
  cursor: pointer;
`

const Dropdown = ({
  firstItem,
  externalLinks,
  middleItems,
  dropdownButton,
  primaryColor,
  appName,
}) => {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return
    }
    setOpen(false)
  }
  const classes = useStyles()

  return (
    <div>
      <ButtonContainer>
        <Button
          className={classes.root}
          aria-owns={open ? 'menu-list-grow' : undefined}
          aria-haspopup={'true'}
          ref={anchorRef}
          onClick={handleToggle}
        >
          {dropdownButton ? dropdownButton.icon : null}
        </Button>
        {dropdownButton.text ? (
          <ButtonText appName={appName} onClick={handleToggle}>
            {dropdownButton.text && dropdownButton.text}
          </ButtonText>
        ) : null}
      </ButtonContainer>
      <Popper open={open} anchorEl={anchorRef.current} transition>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper id={'menu-list-grow'}>
              <ClickAwayListener onClickAway={handleClose}>
                <DropdownList>
                  {firstItem && (
                    <FirstItem
                      color={primaryColor}
                      appName={appName}
                      firstItem={firstItem}
                    />
                  )}
                  {externalLinks && (
                    <ExtLinks externalLinks={externalLinks} setOpen={setOpen} />
                  )}
                  {middleItems && (
                    <MiddleItems middleItems={middleItems} setOpen={setOpen} />
                  )}
                </DropdownList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  )
}

Dropdown.propTypes = {
  appName: PropTypes.string.isRequired,
  firstItem: PropTypes.object,
  externalLinks: PropTypes.array,
  middleItems: PropTypes.array,
  lastItem: PropTypes.object,
  dropdownButton: PropTypes.any,
  primaryColor: PropTypes.string,
}

export { Dropdown as HeaderDropdown }
