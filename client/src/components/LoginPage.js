//LoginPage.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";
import { styled } from "@mui/system";
import axiosInstance from "../axiosInstance";
import { setAuthToken } from "../axiosInstance";
import { jwtDecode } from "jwt-decode";
import { InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const LoginContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  backgroundImage: `url(home-image.png)`, // Set the background image
  backgroundSize: "cover", // Scale the image to cover the container
  backgroundPosition: "center", // Center the image within the container
  backgroundRepeat: "no-repeat", // Prevent the image from repeating
  backgroundColor: theme.palette.background.default,
}));

const LoginForm = styled(Box)(({ theme }) => ({
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

const LoginButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const ForgotPasswordButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

function LoginPage() {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const loginButtonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        // Decode the token to check if it's valid
        jwtDecode(token);
        // If the token is valid, redirect to the home page
        navigate("/home");
      } catch (error) {
        // If the token is invalid, remove it from local storage
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/login", {
        usernameOrEmail,
        password,
      });
      if (response.status === 200) {
        // Login successful, store the token in local storage
        const { token } = response.data;
        setIsLoading(true); // Set isLoading to true
        setAuthToken(token);
        // Wait for a short duration to ensure the token is set before navigating
        setTimeout(() => {
          setIsLoading(false); // Set isLoading back to false
          navigate("/home");
        }, 1000); // Adjust the duration as needed
      } else {
        setError("Los credenciales ingresados son inválidos. Intenta de nuevo.");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError("Los credenciales ingresados son inválidos. Intenta de nuevo.");
      } else {
        console.error("An error occurred during login:", error);
        setError("Un error ocurrió. Por favor intentalo más tarde.");
      }
      setIsLoading(false); // Set isLoading back to false in case of an error
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      loginButtonRef.current.click();
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <LoginContainer>
      <LoginForm>
        <Typography variant="h5" component="h1" gutterBottom>
          Inicio de sesión
        </Typography>
        {error && !isLoading && (
          <Alert severity="error" sx={{ width: "100%", marginBottom: 2 }}>
            {error}
          </Alert>
        )}
        {isLoading ? (
          <Typography variant="body1" align="center">
            Iniciando sesión...
          </Typography>
        ) : (
          <>
            <TextField
              label="Nombre de usuario o correo"
              variant="outlined"
              margin="normal"
              fullWidth
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <TextField
              label="Contraseña"
              variant="outlined"
              margin="normal"
              fullWidth
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <LoginButton
              ref={loginButtonRef}
              variant="contained"
              color="primary"
              onClick={handleLogin}
            >
              Iniciar sesión
            </LoginButton>
            <ForgotPasswordButton
              variant="text"
              color="primary"
              onClick={handleForgotPassword}
            >
              ¿Olvidaste tu contraseña?
            </ForgotPasswordButton>
          </>
        )}
      </LoginForm>
    </LoginContainer>
  );
}
export default LoginPage;
