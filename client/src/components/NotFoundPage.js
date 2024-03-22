import React, {useEffect} from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';

const NotFoundContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const CenteredContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flexGrow: 1,
}));

function NotFoundPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  useEffect(() => {
    let token = localStorage.getItem('token');
    if (!token) {
       navigate('/login');
    }
  }, [navigate]);

  if (!token) {
    return null;
  }

  return (
    <NotFoundContainer>
      <Header />
      <CenteredContent>
        <Typography variant="h4" component="h1" gutterBottom>
          404 - Page Not Found
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          The page you are looking for does not exist.
        </Typography>
        <Button component={Link} to="/login" variant="contained" color="primary">
          Go back
        </Button>
      </CenteredContent>
    </NotFoundContainer>
  );
}

export default NotFoundPage;