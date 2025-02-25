import styled from 'styled-components'
import Tooltip from '@material-ui/core/Tooltip'
import PropTypes from 'prop-types'
import { theme } from '../theme/index'

const StatsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${(p) => (p.centered ? 'center' : null)};
  margin: ${theme.spacing.medium} 0;
`

const Stat = styled.div`
  padding: 0 ${theme.spacing.medium};
  padding-left: ${(p) => (p.i < 1 ? '0' : null)};
  border-left: ${(p) => (p.i > 0 ? '1px solid lightgrey' : null)};
  text-align: center;
`

const StatLabel = styled.p`
  font-variant: all-small-caps;
  margin: 0;
`

const StatNumber = styled.p`
  margin: 0;
  font-size: ${theme.font.size.large};
  color: ${(p) => (p.color ? p.color : theme.color[p.appName].primary)};
`

const Stats = ({ stats, appName, color, centered }) => {
  return (
    <StatsContainer centered={centered}>
      {stats.map((stat, i) => (
        <Tooltip
          key={i}
          title={stat.tooltip ? stat.tooltip : ''}
          enterDelay={500}
        >
          <Stat i={i} totalItems={stats.length}>
            <StatNumber color={color} appName={appName}>
              {stat.number}
            </StatNumber>
            <StatLabel>{stat.label}</StatLabel>
          </Stat>
        </Tooltip>
      ))}
    </StatsContainer>
  )
}

Stats.propTypes = {
  appName: PropTypes.string.isRequired,
  stats: PropTypes.array,
  color: PropTypes.string,
  centered: PropTypes.bool,
}

export { Stats }
