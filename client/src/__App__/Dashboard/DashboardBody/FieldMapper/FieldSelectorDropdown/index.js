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
import { makeStyles } from '@material-ui/core/styles'
import config from '../../../../../config'
import { theme } from '../../../../../j-comps'

const DropdownList = styled(MenuList)`
  max-height: 600px;
  overflow: auto;
  width: 100%;
`

const NoItemsText = styled.div`
  font-family: ${theme.font.stack};

  color: black;
  margin: 15px;
`

const FirstMenuItem = styled.div`
  font-family: ${theme.font.stack};
  font-weight: bold;
  color: black;
  margin: 15px;
`

const useStyles = makeStyles(() => ({
  lastItem: {
    backgroundColor: theme.color.monday.error,
    justifyContent: 'flex-start',
  },
  label: {
    justifyContent: 'flex-start',
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
    <div style={{ margin: '0 10px' }}>
      <Button
        className={isLastItem ? lastItem : classes.label}
        onClick={handleClick}
        style={{ width: '100%' }}
      >
        {children}
      </Button>
    </div>
  )
}

const FirstItem = ({ firstItem, color, appName }) => {
  const appColor = theme.color[appName].primary
  const primaryColor = color ? color : appColor ? appColor : 'blue'
  return (
    <FirstMenuItem
      disabled
      classes={{ root: 'my-root-class' }}
      onClick={() => firstItem.onClick()}
      color={primaryColor}
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

  return (
    <>
      {externalLinks.map((item, i) => (
        <Fragment key={i}>
          <MenuItem key={i} onClick={() => handleClick(item.href)}>
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
      {middleItems.map((item, i) => {
        return item.noItems ? (
          <NoItemsText key={i}>{item.text}</NoItemsText>
        ) : (
          <ClosableMenuItem
            key={i}
            setOpen={setOpen}
            onClick={() => item.onClick()}
            isLastItem={item.isLastItem ? true : false}
          >
            {item.text}
          </ClosableMenuItem>
        )
      })}
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

const FieldSelectorDropdown = ({
  firstItem,
  externalLinks,
  middleItems,
  dropdownButton,
  primaryColor,
  appName = config.app,
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

  return (
    <div>
      <ButtonContainer>
        <Button
          variant={'contained'}
          aria-owns={open ? 'menu-list-grow' : undefined}
          aria-haspopup={'true'}
          ref={anchorRef}
          onClick={handleToggle}
        >
          {dropdownButton ? dropdownButton.icon : null}
        </Button>
        {dropdownButton.text ? (
          <ButtonText
            color={primaryColor}
            appName={appName}
            onClick={handleToggle}
          >
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

FieldSelectorDropdown.propTypes = {
  appName: PropTypes.string,
  firstItem: PropTypes.object,
  externalLinks: PropTypes.array,
  middleItems: PropTypes.array,
  lastItem: PropTypes.object,
  dropdownButton: PropTypes.any,
  primaryColor: PropTypes.string,
}

export { FieldSelectorDropdown }
