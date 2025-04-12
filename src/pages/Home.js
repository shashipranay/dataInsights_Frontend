import { Box, Button, Container, Grid, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Data File Runner
        </Typography>
        <Typography variant="h5" color="textSecondary" paragraph>
          Upload your data files and create beautiful interactive charts
        </Typography>
        <Grid container spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => navigate('/upload')}
            >
              Upload Files
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="outlined" 
              color="primary" 
              size="large"
              onClick={() => navigate('/charts')}
            >
              Create Charts
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;