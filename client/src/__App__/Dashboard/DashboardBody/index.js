import { makeStyles } from '@material-ui/core'
import { connect } from 'react-redux'
import FieldMapper from './FieldMapper'
import WizardGuide from './WizardGuide'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.backgroundColor,
  },
}))
const DashboardBody = ({ dashboardView }) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      {dashboardView === 'field-mapper' && <FieldMapper />}
      {dashboardView === 'wizard-guide' && <WizardGuide />}
    </div>
  )
}

const mapStateToProps = (state) => ({
  dashboardView: state.dashboardView,
})

export default connect(mapStateToProps)(DashboardBody)
