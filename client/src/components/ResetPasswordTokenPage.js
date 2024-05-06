// ResetPasswordTokenPage.js
import React, { useState, useEffect } from 'react';
import { Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Box, Paper } from '@mui/material';
import { styled } from '@mui/system';
import axiosInstance from "../axiosInstance";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useLocation, useNavigate } from 'react-router-dom';

const ResetPasswordTokenContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundImage: `url(home-image.png)`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundColor: theme.palette.background.default,
}));

const ResetPasswordTokenForm = styled(Paper)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
}));

const SubmitButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

function ResetPasswordTokenPage() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [messageDialogOpen, setMessageDialogOpen] = useState(false);
    const [messageDialogContent, setMessageDialogContent] = useState('');
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorDialogContent, setErrorDialogContent] = useState('');

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
            await axiosInstance.post('/reset-password', {
                newPassword: newPassword,
                token: token,
            });
            setMessageDialogContent('La contraseña se ha actualizado correctamente.');
            setMessageDialogOpen(true);
        } catch (error) {
            console.error("Error resetting password:", error);
            setErrorDialogContent(error.response.data.message || 'Ocurrió un error al actualizar la contraseña.');
            setErrorDialogOpen(true);
        }
    };

    const handleMessageDialogClose = () => {
        setMessageDialogOpen(false);
        navigate('/login'); // Navigate to the "/login" route
    };

    return (
        <ResetPasswordTokenContainer>
            <ResetPasswordTokenForm>
                <Typography variant="h5" component="h1" gutterBottom>
                    Restablecer contraseña
                </Typography>
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
                <SubmitButton
                    variant="contained"
                    color="primary"
                    onClick={handleResetPassword}
                    disabled={!isValidPassword(newPassword) || newPassword !== confirmNewPassword}
                >
                    Restablecer contraseña
                </SubmitButton>
            </ResetPasswordTokenForm>
            <Dialog open={messageDialogOpen} onClose={handleMessageDialogClose}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon color="success" sx={{ marginRight: 1 }} />
                    <Typography>Notificación</Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography>{messageDialogContent}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleMessageDialogClose}>OK</Button>
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
        </ResetPasswordTokenContainer>
    );
}

export default ResetPasswordTokenPage;