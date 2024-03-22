// MyProfile.js
import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Avatar, Divider } from '@mui/material';
import { styled } from '@mui/system';
import Header from './Header';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../axiosInstance';
import { Email, Phone, Person, CalendarToday } from '@mui/icons-material';

const ProfileContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
}));

const Main = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(4),
}));

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

function MyProfile() {
  const token = localStorage.getItem('token');
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userId;

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(`/users/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, [userId, token]);

  return (
    <ProfileContainer>
      <Header />
      <Main>
        <Typography variant="h4" component="h1" gutterBottom>
          Mi perfil
        </Typography>
        {user ? (
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="center" mb={2}>
                <Avatar alt={user.name} src={user.avatarUrl} sx={{ width: 120, height: 120 }} />
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Email sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" color="textSecondary">Email:</Typography>
                    <Typography variant="body1">{user.email}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Phone sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" color="textSecondary">Teléfono:</Typography>
                    <Typography variant="body1">{user.phone}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Person sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" color="textSecondary">Nombre de usuario:</Typography>
                    <Typography variant="body1">{user.username}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" color="textSecondary">Nombre:</Typography>
                    <Typography variant="body1">{user.name}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" color="textSecondary">Apellido:</Typography>
                    <Typography variant="body1">{user.lastname}</Typography>
                  </Box>
                </Grid>
              </Grid>
              <Divider variant="middle" sx={{ my: 2 }} />
              <Box display="flex" alignItems="center">
                <CalendarToday sx={{ mr: 1 }} />
                <Typography variant="subtitle1" color="textSecondary">Usuario creado en: </Typography>
                <Typography variant="body1">{formatDate(user.createdAt)}</Typography>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Typography>Cargando información del usuario...</Typography>
        )}
      </Main>
    </ProfileContainer>
  );
}

export default MyProfile;