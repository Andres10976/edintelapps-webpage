// HomePage.js
import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import Header from './Header';
import { jwtDecode } from 'jwt-decode';

const HomeContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
}));

const Main = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(4),
}));
function HomePage() {
  const token = localStorage.getItem('token');
  const decodedToken = jwtDecode(token);
  return (
    <HomeContainer>
      <Header />
      <Main>
        <Typography variant="h4" component="h1" gutterBottom>
          ¡Bienvenido de vuelta {decodedToken.name}!
        </Typography>
      </Main>
    </HomeContainer>
  );
}

export default HomePage;