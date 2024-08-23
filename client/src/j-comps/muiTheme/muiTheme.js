import { createTheme } from '@material-ui/core/styles'
import { theme } from '../theme/index'

const getTheme = (mondayColorMode) => {
  if (mondayColorMode === 'dark') {
    return {
      color: 'white',
      backgroundColor: '#191c34',
      secondaryBackgroundColor: '#32364a',
      secondaryColor: 'white',
      headerBorderBottom: '#4b4e69',
      overrides: {
        MuiButton: {
          root: {
            borderRadius: '4px',
            textTransform: 'none',
            fontWeight: 'bold',
            minWidth: `${theme.spacing.large}`,
            border: '1px solid white',
            padding: '8px 16px',
            color: theme.color.monday.black,
            '&:disabled': {
              borderColor: 'white',
              backgroundColor: 'white',
              color: '#676879',
            },

            '&:hover': {
              borderColor: 'white',
              backgroundColor: '#e6e9ee',
              color: theme.color.monday.black,
            },

            '&:active': {
              borderColor: theme.color.monday.highlight,
              backgroundColor: theme.color.monday.highlight,
              color: theme.color.monday.primary,
            },
          },
          contained: {
            padding: '8px 16px',
            boxShadow: 'none',
            textTransform: 'none',
            border: '1px solid #e6e9ee',
            backgroundColor: 'white',
            color: theme.color.monday.black,

            '&:disabled': {
              backgroundColor: 'white',
              color: '#676879',
              borderColor: '#e6e9ee',
              boxShadow: 'none',
            },

            '&:hover': {
              border: '1px solid #e6e9ee',
              color: theme.color.monday.black,
              boxShadow: 'none',
            },

            '&:active': {
              boxShadow: 'none',
              backgroundColor: theme.color.monday.highlight,
              borderColor: theme.color.monday.primary,
              color: theme.color.monday.primary,
            },
          },
          outlined: {
            padding: '8px 16px',
            textTransform: 'none',
            backgroundColor: theme.color.monday.primary,
            borderColor: theme.color.monday.primary,
            color: 'white',

            '&:disabled': {
              backgroundColor: '#e6e9ee',
              color: '#676879',
            },

            '&:hover': {
              color: 'white',
              backgroundColor: theme.color.monday.primaryHover,
              borderColor: theme.color.monday.primaryHover,
            },
          },
        },
        MuiInputBase: {
          root: {
            color: 'black',
            borderRadius: '5px',
            padding: `0 ${theme.spacing.medium}`,
            '&:hover': {
              backgroundColor: 'white',
            },
          },
        },
        MuiChip: {
          root: {
            backgroundColor: theme.color.monday.highlight,
            color: theme.color.monday.primary,
          },
          deleteIcon: {
            color: theme.color.monday.primary,
            '&:hover': {},
          },
        },
      },
    }
  } else {
    return {
      color: 'black',
      backgroundColor: 'white',
      secondaryBackgroundColor: 'white',
      secondaryColor: 'grey',
      headerBorderBottom: '#e6e9ee',
      overrides: {
        MuiButton: {
          root: {
            borderRadius: '4px',
            textTransform: 'none',
            fontWeight: 'bold',
            minWidth: `${theme.spacing.large}`,
            border: '1px solid white',
            padding: '8px 16px',
            color: theme.color.monday.black,
            '&:disabled': {
              borderColor: 'white',
              backgroundColor: 'white',
              color: '#676879',
            },

            '&:hover': {
              borderColor: 'white',
              backgroundColor: '#e6e9ee',
              color: theme.color.monday.black,
            },

            '&:active': {
              borderColor: theme.color.monday.highlight,
              backgroundColor: theme.color.monday.highlight,
              color: theme.color.monday.primary,
            },
          },
          contained: {
            padding: '8px 16px',
            boxShadow: 'none',
            textTransform: 'none',
            border: '1px solid #e6e9ee',
            backgroundColor: 'white',
            color: theme.color.monday.black,

            '&:disabled': {
              backgroundColor: 'white',
              color: '#676879',
              borderColor: '#e6e9ee',
              boxShadow: 'none',
            },

            '&:hover': {
              border: '1px solid #e6e9ee',
              color: theme.color.monday.black,
              boxShadow: 'none',
            },

            '&:active': {
              boxShadow: 'none',
              backgroundColor: theme.color.monday.highlight,
              borderColor: theme.color.monday.primary,
              color: theme.color.monday.primary,
            },
          },
          outlined: {
            padding: '8px 16px',
            textTransform: 'none',
            backgroundColor: theme.color.monday.primary,
            borderColor: theme.color.monday.primary,
            color: 'white',

            '&:disabled': {
              backgroundColor: '#e6e9ee',
              color: '#676879',
            },

            '&:hover': {
              color: 'white',
              backgroundColor: theme.color.monday.primaryHover,
              borderColor: theme.color.monday.primaryHover,
            },
          },
        },
        MuiInputBase: {
          root: {
            color: 'black',
            borderRadius: '5px',
            padding: `0 ${theme.spacing.medium}`,
            '&:hover': {
              backgroundColor: 'white',
            },
          },
        },
        MuiChip: {
          root: {
            backgroundColor: theme.color.monday.highlight,
            color: theme.color.monday.primary,
          },
          deleteIcon: {
            color: theme.color.monday.primary,
            '&:hover': {},
          },
        },
      },
    }
  }
}

const muiTheme = ({ mondayColorMode }) => {
  const mondayTheme = getTheme(mondayColorMode)
  return createTheme({
    typography: {
      fontFamily: "'Roboto', sans-serif",
    },
    palette: {
      primary: {
        main: theme.color.monday.primary,
      },
    },
    ...mondayTheme,
  })
}

export { muiTheme }
