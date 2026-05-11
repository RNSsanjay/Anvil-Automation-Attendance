'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#7C3AED', // violet-600
      light: '#A78BFA', // violet-400
      dark: '#5B21B6', // violet-800
    },
    secondary: {
      main: '#A78BFA',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FAFAFF',
    },
    text: {
      primary: '#0F0A1E',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h1: {
      fontFamily: '"Syne", sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Syne", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Syne", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Syne", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Syne", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Syne", sans-serif',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 24px rgba(124, 58, 237, 0.08)',
          border: '1px solid #EDE9FE',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '& fieldset': {
              borderColor: '#EDE9FE',
            },
            '&:hover fieldset': {
              borderColor: '#A78BFA',
            },
          },
        },
      },
    },
  },
});

export default theme;
