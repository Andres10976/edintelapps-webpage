// ResetPasswordPage.js
import React, { useState, useEffect } from 'react';
import { Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Box, Paper } from '@mui/material';
import Header from './Header';
import { CustomMain, CustomContainer } from "./styledComponents";
import axiosInstance from "../axiosInstance";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { jwtDecode } from 'jwt-decode';

function ResetPasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageDialogContent, setMessageDialogContent] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogContent, setErrorDialogContent] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userId;

  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
    return passwordRegex.test(password);
  };

  useEffect(() => {
    if (newPassword && !isValidPassword(newPassword)) {
      setPasswordError('La nueva contraseña no cumple con los requisitos de seguridad.');
    } else {
      setPasswordError('');
    }
  }, [newPassword]);

  useEffect(() => {
    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden.');
    } else {
      setConfirmPasswordError('');
    }
  }, [newPassword, confirmNewPassword]);

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      await axiosInstance.post(`/users/${userId}/reset-password`, {
        actualPassword: currentPassword,
        newPassword: newPassword,
      });
      setMessageDialogContent('La contraseña se ha actualizado correctamente.');
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error resetting password:", error);
      setErrorDialogContent(error.response.data.message || 'Ocurrió un error al actualizar la contraseña.');
      setErrorDialogOpen(true);
    } finally {
      setLoading(false); // Set loading back to false after the API call completes
    }
  };

  return (
    <CustomContainer>
      <Header />
      <CustomMain>
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          Cambiar contraseña
        </Typography>
        <Box display="flex" justifyContent="center">
          <Paper elevation={3} sx={{ padding: '2rem', maxWidth: '400px' }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <TextField
                label="Contraseña actual"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                margin="normal"
                fullWidth
              />
              <TextField
                label="Nueva contraseña"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                margin="normal"
                fullWidth
                error={!!passwordError}
                helperText={passwordError}
              />
              <Typography variant="body2" color="textSecondary" align="center" style={{ marginTop: '0.5rem' }}>
                La nueva contraseña debe tener al menos 8 caracteres y contener al menos una letra mayúscula, una letra minúscula y un número.
              </Typography>
              <TextField
                label="Confirmar nueva contraseña"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                margin="normal"
                fullWidth
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleResetPassword}
                disabled={!isValidPassword(newPassword) || newPassword !== confirmNewPassword || loading}
                style={{ marginTop: '1rem' }}
              >
                Cambiar contraseña
              </Button>
            </Box>
          </Paper>
        </Box>
      </CustomMain>

      <Dialog open={messageDialogOpen} onClose={() => setMessageDialogOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <CheckCircleIcon color="success" sx={{ marginRight: 1 }} />
          <Typography>Notificación</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>{messageDialogContent}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialogOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <ErrorIcon color="error" sx={{ marginRight: 1 }} />
          <Typography color="error">{"Error"}</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>{errorDialogContent}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </CustomContainer>
  );
}

export default ResetPasswordPage;