// TechnicianPage.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { styled } from "@mui/system";
import Header from "./Header";
import axiosInstance from "../axiosInstance";

const TechnicianPageContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
}));

const Main = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(4),
}));

const SearchBox = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const RequestCard = styled(Card)(({ theme }) => ({
  cursor: "pointer",
  transition: "background-color 0.3s",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

function TechnicianPage() {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;
        const response = await axiosInstance.get(
          `/technicians/${userId}/requests`
        );
        setRequests(response.data);
      } else {
        console.error("No token found in local storage");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredRequests = requests.filter((request) => {
    const { code, siteName, systemName, clientName } = request;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      code.toLowerCase().includes(lowerCaseSearchTerm) ||
      siteName.toLowerCase().includes(lowerCaseSearchTerm) ||
      systemName.toLowerCase().includes(lowerCaseSearchTerm) ||
      clientName.toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedRequest(null);
    setOpenDialog(false);
  };

  const handleConfirmationDialog = (action) => {
    setConfirmationAction(action);
    setOpenConfirmationDialog(true);
  };

  const handleCloseConfirmationDialog = () => {
    setOpenConfirmationDialog(false);
    setConfirmationAction("");
  };

  const handleAcknowledgeRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;
        await axiosInstance.post(
          `/technicians/${userId}/requests/${selectedRequest.id}/acknowledge`
        );
        fetchRequests();
        handleCloseDialog();
        handleCloseConfirmationDialog();
      } else {
        console.error("No token found in local storage");
      }
    } catch (error) {
      console.error("Error acknowledging request:", error);
    }
  };

  const handleStartRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;
        await axiosInstance.post(
          `/technicians/${userId}/requests/${selectedRequest.id}/start`
        );
        fetchRequests();
        handleCloseDialog();
        handleCloseConfirmationDialog();
      } else {
        console.error("No token found in local storage");
      }
    } catch (error) {
      console.error("Error starting request:", error);
    }
  };

  return (
    <TechnicianPageContainer>
      <Header />
      <Main>
        <Typography variant="h4" component="h1" gutterBottom>
          Solicitudes
        </Typography>
        <SearchBox
          label="Buscar solicitudes"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
        />
        <Grid container spacing={2}>
          {filteredRequests.map((request) => (
            <Grid item xs={12} sm={6} md={4} key={request.id}>
              <RequestCard onClick={() => handleRequestClick(request)}>
                <CardContent>
                  <Typography variant="h6">{request.code}</Typography>
                  <Typography color="textSecondary">
                    {request.clientName}
                  </Typography>
                  <Typography color="textSecondary">
                    {request.siteName}
                  </Typography>
                  <Typography color="textSecondary">
                    {request.systemName}
                  </Typography>
                  <Typography color="textSecondary">
                    {request.requestTypeName}
                  </Typography>
                </CardContent>
              </RequestCard>
            </Grid>
          ))}
        </Grid>
      </Main>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        {selectedRequest && (
          <>
            <DialogTitle>{selectedRequest.code}</DialogTitle>
            <DialogContent>
              <Typography>Cliente: {selectedRequest.clientName}</Typography>
              <Typography>Sitio: {selectedRequest.siteName}</Typography>
              <Typography>Sistema: {selectedRequest.systemName}</Typography>
              <Typography>Código: {selectedRequest.code}</Typography>
              <Typography>Alcance: {selectedRequest.scope}</Typography>
              <Typography>
                Tipo de solicitud: {selectedRequest.requestTypeName}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cerrar</Button>
              {selectedRequest.status === 2 && (
                <Button
                  onClick={() => handleConfirmationDialog("acknowledge")}
                  color="primary"
                >
                  Confirmar
                </Button>
              )}
              {selectedRequest.status === 3 && (
                <Button
                  onClick={() => handleConfirmationDialog("start")}
                  color="primary"
                >
                  Iniciar
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      <Dialog
        open={openConfirmationDialog}
        onClose={handleCloseConfirmationDialog}
      >
        <DialogTitle>Confirmar acción</DialogTitle>
        <DialogContent>
          {confirmationAction === "acknowledge" && (
            <Typography>
              ¿Estás seguro que deseas confirmar la solicitud "
              {selectedRequest?.code}"?
            </Typography>
          )}
          {confirmationAction === "start" && (
            <Typography>
              ¿Estás seguro que deseas iniciar la solicitud "
              {selectedRequest?.code}"?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmationDialog}>Cancelar</Button>
          {confirmationAction === "acknowledge" && (
            <Button onClick={handleAcknowledgeRequest} color="primary">
              Confirmar
            </Button>
          )}
          {confirmationAction === "start" && (
            <Button onClick={handleStartRequest} color="primary">
              Iniciar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </TechnicianPageContainer>
  );
}

export default TechnicianPage;
