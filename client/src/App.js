import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "@fontsource/roboto";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import SystemsPage from "./components/SystemsPage";
import UnauthorizedPage from "./components/UnauthorizedPage";
import NotFoundPage from "./components/NotFoundPage";
import PrivateRoute from "./components/PrivateRoute";
import MyProfile from "./components/MyProfile";
import UsersPage from "./components/UsersPage";
import RequestsPage from "./components/RequestsPage";
import ClientPage from "./components/ClientPage";
import { Navigate } from "react-router-dom";
import SitesPage from "./components/SitesPage";
import TechnicianPage from "./components/TechniciansPage";

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Navigate to="/home" />
              </PrivateRoute>
            }
          />
          <Route
            path="/home"
            element={
              <PrivateRoute allowedRoles={[1, 2, 3, 4, 5]}>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/myprofile"
            element={
              <PrivateRoute allowedRoles={[1, 2, 3, 4, 5]}>
                <MyProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute allowedRoles={[1, 2]}>
                <UsersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/systems"
            element={
              <PrivateRoute allowedRoles={[1, 2, 3]}>
                <SystemsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <PrivateRoute allowedRoles={[1, 2, 3]}>
                <RequestsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <PrivateRoute allowedRoles={[1, 2, 3]}>
                <ClientPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/sites"
            element={
              <PrivateRoute allowedRoles={[1, 2, 3]}>
                <SitesPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/technicians"
            element={
              <PrivateRoute allowedRoles={[3, 4]}>
                <TechnicianPage />
              </PrivateRoute>
            }
          />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
