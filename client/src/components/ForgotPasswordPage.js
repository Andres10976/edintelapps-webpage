// ForgotPasswordPage.js
import React, { useState } from 'react';
import { Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
import { styled } from '@mui/system';
import axiosInstance from "../axiosInstance";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const ForgotPasswordContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  backgroundImage: `url(home-image.png)`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundColor: theme.palette.background.default,
}));

const ForgotPasswordForm = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  maxWidth: 400,
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

function ForgotPasswordPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageDialogContent, setMessageDialogContent] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogContent, setErrorDialogContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    try {
      setLoading(true);
      await axiosInstance.post('/forgot-password', { usernameOrEmail });
      setMessageDialogContent('Se ha enviado un enlace para restablecer la contraseña a su correo electrónico, en caso de que el correo o nombre de usuario ingresado existe.');
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error sending forgot password email:", error);
      setErrorDialogContent(error.response.data.message || 'Ocurrió un error al enviar el correo electrónico de restablecimiento de contraseña.');
      setErrorDialogOpen(true);
    } finally {
      setLoading(false); // Set loading back to false after the API call completes
    }
  };

  return (
    <ForgotPasswordContainer>
      <ForgotPasswordForm>
        <Typography variant="h5" component="h1" gutterBottom>
          Olvidé mi contraseña
        </Typography>
        <TextField
          label="Correo electrónico o nombre de usuario"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          margin="normal"
          fullWidth
        />
        <SubmitButton
          variant="contained"
          color="primary"
          onClick={handleForgotPassword}
          disabled={!usernameOrEmail || loading}
        >
          Enviar enlace de restablecimiento
        </SubmitButton>
      </ForgotPasswordForm>
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
    </ForgotPasswordContainer>
  );
}

export default ForgotPasswordPage;