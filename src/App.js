import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, CssBaseline, Box } from '@mui/material';
import WeeklyTasks from './components/WeeklyTasks';
import './App.css';

function App() {
  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ width: '100%', mt: 4, mb: 4 }}>
          <WeeklyTasks />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
