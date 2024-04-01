// UnauthorizedPage.js
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { styled } from "@mui/system";
import { Link } from "react-router-dom";
import Header from "./Header";

const UnauthorizedContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
}));

const CenteredContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  flexGrow: 1,
}));

function UnauthorizedPage() {
  return (
    <UnauthorizedContainer>
      <Header />
      <CenteredContent>
        <Typography variant="h4" component="h1" gutterBottom>
          401 - No autorizado
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          No tienes los permisos para accesar a esta página.
        </Typography>
        <Button
          component={Link}
          to="/login"
          variant="contained"
          color="primary"
        >
          Ir atrás
        </Button>
      </CenteredContent>
    </UnauthorizedContainer>
  );
}

export default UnauthorizedPage;
