import Button from '@material-ui/core/Button'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { theme } from '../theme/index'
import { makeStyles } from '@material-ui/core'

const HeaderContainer = styled.div`
  display: flex;
  justify-content: ${(p) =>
    (p.items && p.items.length) || p.genericitems
      ? 'space-between'
      : 'flex-end'};
  padding: ${theme.spacing.small} ${theme.spacing.medium};
  font-variant: all-small-caps;
`

const SettingsContainer = styled.div`
  color: ${(p) => theme.color[p.namespace].primary};
  display: flex;
  align-items: center;
`

const ButtonContainer = styled.div`
  text-align: center;
`
const ButtonText = styled.div`
  cursor: pointer;
  color: ${(p) => theme.color[p.namespace].primary};
  border-bottom: ${(p) =>
    p.classes ? `2px solid ${theme.color[p.namespace].primary}` : null};
`

const HeaderButton = ({ onClick, text, namespace, classes, children }) => {
  return (
    <ButtonContainer>
      <Button onClick={onClick} aria-label={text} className={classes}>
        {children}
      </Button>
      <ButtonText namespace={namespace} onClick={onClick} classes={classes}>
        {text}
      </ButtonText>
    </ButtonContainer>
  )
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.backgroundColor,
    borderBottom: `1px solid ${theme.headerBorderBottom}`,
  },
}))
const Header = ({ namespace, genericitems, items, settingsButton }) => {
  const classes = useStyles()
  return (
    <HeaderContainer
      className={classes.root}
      namespace={namespace}
      genericitems={genericitems}
      items={items}
    >
      {genericitems}
      {items &&
        items.map((item, i) => (
          <HeaderButton
            namespace={namespace}
            key={i}
            onClick={item.onClick}
            text={item.text}
            classes={item.classes}
          >
            {item.icon}
          </HeaderButton>
        ))}
      <SettingsContainer namespace={namespace}>
        {settingsButton && settingsButton}
      </SettingsContainer>
    </HeaderContainer>
  )
}

Header.propTypes = {
  namespace: PropTypes.string.isRequired,
  genericItems: PropTypes.any,
  items: PropTypes.array,
  settingsButton: PropTypes.element,
}

HeaderButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  text: PropTypes.string,
}

export { Header }
