import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import { Button, Divider, ListSubheader } from '@material-ui/core'
import { connect } from 'react-redux'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { theme } from '../../../../../../j-comps'
import InfoIcon from '@material-ui/icons/InfoOutlined'
import styled from 'styled-components'
import DuplicateCopyIcon from 'monday-ui-react-core/dist/icons/Duplicate'
import { createMondayItem } from '../../../../../../data/actions/monday'
import { Tooltip } from '../../../../../../components/Tooltip/Tooltip'
import { BadgeAvatars } from './AvatarWithBadge/AvatarWithBadge'
import { getNetworkIcon } from '../../../../../../utils'
import { Skeleton } from '@material-ui/lab'
import AddIcon from 'monday-ui-react-core/dist/icons/AddSmall'
import WarningIcon from 'monday-ui-react-core/dist/icons/Alert'

const ItemContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const Overlay = styled.div`
  width: 100%;
  height: 100%;
  z-index: 1000;
`

const OverlayText = styled.div`
  display: grid;
  place-items: center;
  height: 250px;
  text-align: center;
  padding: 20px;
`

const SocialUsernameContainer = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
`

const SocialIdContainer = styled.div`
  display: flex;
  align-items: center;
  color: grey;
`

const SocialIdText = styled.div`
  cursor: pointer;
  margin: 0;
`

const HelperTextContainer = styled.div`
  padding: 0 10px 10px 10px;
  display: flex;
  align-items: center;
  display: center;
`

const HelperText = styled.p`
  font-weight: bold;
  margin-top: 0;
`

const HelperNoteContainer = styled.div`
  display: flex;
  align-items: center;
`

const HelperNote = styled.p`
  font-size: 14px;
  margin-left: 10px;
`

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    color: theme.color,
    backgroundColor: theme.secondaryBackgroundColor,
    padding: '0',
  },
  loadingDiv: {
    borderBottom: `1px solid ${theme.headerBorderBottom}`,
  },
  overlay: {
    backgroundColor: theme.secondaryBackgroundColor,
    color: theme.secondaryColor,
  },
}))

const SocialUsername = ({ p, handleCreateClick }) => {
  const tooltipTitle =
    p.socialNetworkUsername !== null
      ? 'Create a new draft message item in monday.com'
      : 'Could not retrieve Twitter profile. Please check Twitter profile in Hootsuite.'
  return (
    <Tooltip title={tooltipTitle}>
      <SocialUsernameContainer onClick={handleCreateClick}>
        {p.socialNetworkUsername === null ? (
          <WarningIcon style={{ marginRight: '5px' }} />
        ) : undefined}
        {p.socialNetworkUsername !== null ? p.socialNetworkUsername : 'Unknown'}
        <Button style={{ marginLeft: '10px', border: 'none' }}>
          <AddIcon style={{ color: theme.color.monday.primary }} />
        </Button>
      </SocialUsernameContainer>
    </Tooltip>
  )
}

const SocialIdAndCopyButton = ({ monday, p, handleCreateClick }) => {
  const handleCopyClick = (p) => {
    monday.execute('notice', {
      message: `Copied ${p.id} to clipboard for the ${p.type} profile: ${
        p.socialNetworkUsername !== null ? p.socialNetworkUsername : 'Unknown'
      }`,
      type: 'info',
      timeout: 4000,
    })
  }

  return (
    <SocialIdContainer>
      <Tooltip
        title={'Click a social profile to copy the ID to your clipboard.'}
      >
        <SocialIdText onClick={() => handleCreateClick(p)}>{p.id}</SocialIdText>
      </Tooltip>
      <Tooltip
        title={'Click a social profile to copy the ID to your clipboard.'}
      >
        <CopyToClipboard text={p.id} onCopy={() => handleCopyClick(p)}>
          <Button style={{ marginLeft: '10px', border: 'none' }}>
            <DuplicateCopyIcon style={{ color: theme.color.monday.primary }} />
          </Button>
        </CopyToClipboard>
      </Tooltip>
    </SocialIdContainer>
  )
}

const ProfilesList = ({
  hootsuiteUid,
  mondayId,
  monday,
  boardId,
  groupId,
  socialProfiles,
  selectedStatusField,
  selectedChannelField,
  selectedSocialProfileIdField,
  selectedSocialProfileField,
  selectedTitleField,
  isLoadingSocialProfiles,
  ismapped,
  isFieldsLoading,
}) => {
  const classes = useStyles()

  const handleCreateClick = (p) => {
    const fields = {
      selectedStatusField,
      selectedChannelField,
      selectedSocialProfileIdField,
      selectedSocialProfileField,
      selectedTitleField,
    }
    createMondayItem({
      hootsuiteUid,
      monday,
      mondayId,
      boardId,
      groupId,
      hsProfile: p,
      fields,
    })
  }

  return (
    <List className={classes.root}>
      {!isFieldsLoading && !ismapped && (
        <Overlay className={classes.overlay}>
          <OverlayText>
            Some field mappings are missing. Please map the monday.com fields.
          </OverlayText>
        </Overlay>
      )}
      <ListSubheader
        className={classes.root}
        style={{
          padding: '10px',
          fontSize: '24px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          zIndex: '2',
        }}
      >
        Social Profiles
        <Tooltip title={'Create a new draft message item in monday.com'}>
          <InfoIcon style={{ fontSize: '16px', marginLeft: '5px' }} />
        </Tooltip>
      </ListSubheader>
      <HelperTextContainer className={classes.loadingDiv}>
        <div>
          <HelperText>
            Create a new draft message or copy the social profile ID
          </HelperText>
          <HelperNoteContainer>
            <span style={{ fontSize: '24px' }}>
              <WarningIcon />
            </span>
            <HelperNote>
              The Hootsuite scheduled send time must be 5 minutes in the future
              or the message will post automatically to the social network.
            </HelperNote>
          </HelperNoteContainer>
        </div>
      </HelperTextContainer>
      {isLoadingSocialProfiles ? (
        <div
          className={classes.loadingDiv}
          style={{
            padding: '10px',
            display: 'flex',
          }}
        >
          <Skeleton
            animation={'wave'}
            variant={'circle'}
            style={{ width: '50px', height: '50px', margin: '15px' }}
          ></Skeleton>
          <div style={{ width: '30%', marginTop: '10px' }}>
            <Skeleton animation={'wave'} style={{ marginBottom: '5px' }} />
            <Skeleton animation={'wave'} />
          </div>
        </div>
      ) : (
        socialProfiles.map((p, i) => (
          <div key={i}>
            <ListItem>
              <ItemContainer>
                <ListItemAvatar
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCreateClick(p)}
                >
                  <BadgeAvatars
                    alt={
                      p.socialNetworkUsername !== null
                        ? p.socialNetworkUsername
                        : 'Unknown'
                    }
                    src={p.avatarUrl}
                    icon={getNetworkIcon(p.type)}
                    socialNetwork={p.type}
                  />
                </ListItemAvatar>
                <ListItemText style={{ marginLeft: '10px' }}>
                  <SocialUsername
                    handleCreateClick={() => handleCreateClick(p)}
                    p={p}
                  />

                  <SocialIdAndCopyButton
                    monday={monday}
                    p={p}
                    handleCreateClick={handleCreateClick}
                  />
                </ListItemText>
              </ItemContainer>
            </ListItem>
            <Divider />
          </div>
        ))
      )}
    </List>
  )
}
const mapStateToProps = (state) => ({
  hootsuiteUid: state.hootsuiteUid,
  mondayId: state.mondayId,
  boardId: state.boardId,
  groupId: state.groupId,
  socialProfiles: state.socialProfiles,
  monday: state.monday,
  selectedStatusField: state.selectedStatusField,
  selectedChannelField: state.selectedChannelField,
  selectedSocialProfileIdField: state.selectedSocialProfileIdField,
  selectedSocialProfileField: state.selectedSocialProfileField,
  selectedTitleField: state.selectedTitleField,
  isLoadingSocialProfiles: state.isLoadingSocialProfiles,
  isFieldsLoading: state.isFieldsLoading,
})

export default connect(mapStateToProps)(ProfilesList)
