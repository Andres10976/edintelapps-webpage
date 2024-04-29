import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#191e73', // Blue
      light: '#6ec6ff',
      dark: '#0069c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#9e9e9e', // Grey
      light: '#cfcfcf',
      dark: '#707070',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f5', // Light grey background
      paper: '#fff',
    },
    text: {
      primary: '#333333', // Dark grey text
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
  },
  shape: {
    borderRadius: 4, // Rounded corners
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          // Customize the TextField container if needed 
          '& .MuiInputBase-root': { 
            backgroundColor: '#fff', // White background for input field
          },
          // Adjust label color for better contrast if needed
          '& .MuiInputLabel-root': {
            color: '#333333' // Darker color for the label
          } 
        }, 
      },
    },
  },
});

export default theme;