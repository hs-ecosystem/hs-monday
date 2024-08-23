import Alert from '@material-ui/lab/Alert'
import styled from 'styled-components'

const AlertContainer = styled.div`
  margin: 10px;
  padding: 5px;
`
/**
 * Alert will display if alertMessage is not null or ''
 *
 * @param {*} alertMessage String - The message
 * @param {*} onClose Function - When clicking the X button
 * @param {*} severity String - 'error' or One of ['error', 'warning', 'info', 'success']
 * @param {*} variant String - 'standard' or One of ['outlined', 'filled', 'standard']
 */
const CustomAlert = ({
  alertMessage,
  onClose,
  severity = 'error',
  variant = 'standard',
}) => {
  return (
    <AlertContainer>
      {alertMessage && alertMessage !== '' ? (
        <Alert severity={severity} onClose={onClose} variant={variant}>
          {alertMessage}
        </Alert>
      ) : null}
    </AlertContainer>
  )
}

export { CustomAlert as Alert }
