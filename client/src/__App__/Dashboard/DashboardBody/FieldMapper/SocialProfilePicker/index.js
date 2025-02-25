import { Card, makeStyles } from '@material-ui/core'
import styled from 'styled-components'
import ProfilesList from './ProfilesList'
import InfoIcon from '@material-ui/icons/InfoOutlined'
import { ExternalLink } from '../../../../../j-comps'
import config from '../../../../../config'

const Container = styled.div`
  margin: 0;
`

const ListContainer = styled.div`
  max-height: 575px;
  overflow: ${(p) => (p.ismapped ? 'auto' : undefined)};
`

const Text = styled.div`
  display: flex;
  align-items: center;
  margin: 30px 10px;
`

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.secondaryBackgroundColor,
    color: theme.color,
  },
}))

const SocialProfilePicker = ({ ismapped }) => {
  const classes = useStyles()
  return (
    <Container>
      <Card className={classes.root}>
        <div>
          <ListContainer ismapped={ismapped ? 'true' : undefined}>
            <ProfilesList ismapped={ismapped} />
            <ExternalLink href={config.userGuideUrl}>
              <Text className={classes.root}>
                Not seeing your social profile?
                <InfoIcon
                  style={{
                    fontSize: '16px',
                    marginLeft: '10px',
                  }}
                />
              </Text>
            </ExternalLink>
          </ListContainer>
        </div>
      </Card>
    </Container>
  )
}

export default SocialProfilePicker
