import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { Container, Box, Typography } from '@mui/material';
import Tokenizer from './components/Tokenizer';

const darkTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            py: 6,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              Tokenizer
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Count tokens for any OpenAI model or encoding.
            </Typography>
          </Box>
          <Tokenizer />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
