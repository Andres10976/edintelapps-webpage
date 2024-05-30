// ClientPage.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Header from "./Header";
import axiosInstance from "../axiosInstance";
import { jwtDecode } from "jwt-decode";
import {CustomCard, CustomMain, CustomContainer} from "./styledComponents"
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function ClientPage() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [newClient, setNewClient] = useState({
    name: "",
  });
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageDialogContent, setMessageDialogContent] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogContent, setErrorDialogContent] = useState("");
  

  useEffect(() => {
    fetchClients();
    getRoleFromToken();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = jwtDecode(token);
        if (decodedToken.roleId === 5) {
          const response = await axiosInstance.get(`/clients/${decodedToken.clientId}`);
          setClients([response.data]);
        } else {
          const response = await axiosInstance.get("/clients");
          const sortedClients = response.data.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setClients(sortedClients);
        }
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al obtener los clientes. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const getRoleFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setRoleId(decodedToken.roleId);
    }
  };

  const filteredClients = clients.filter((client) => {
    const { name } = client;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  const handleClientClick = (client) => {
    setSelectedClient(client);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedClient(null);
    setOpenDialog(false);
  };

  const handleCreateClient = () => {
    setOpenCreateDialog(true);
  };

  const handleDeleteConfirmation = () => {
    setOpenConfirmationDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setSelectedClient(null);
    setNewClient({
      name: "",
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewClient((prevClient) => ({
      ...prevClient,
      [name]: value,
    }));
  };

  const handleDeleteClient = async () => {
    try {
      const response = await axiosInstance.delete(`/clients/${selectedClient.id}`);
      fetchClients();
      handleCloseDialog();
      setOpenConfirmationDialog(false);
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error deleting client:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al eliminar el cliente. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const isCreateButtonDisabled = () => {
    const { name} = newClient;
    return (
      name.trim().length < 2 
    );
  };

  const handleCreateSubmit = async () => {
    try {
      const response = await axiosInstance.post("/clients", newClient);
      fetchClients();
      handleCloseCreateDialog();
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error creating client:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al crear el cliente. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const canEditClient = [1, 2, 3].includes(roleId);

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setOpenCreateDialog(true);
  };

  return (
    <CustomContainer>
      <Header />
      <CustomMain>
        <Typography variant="h4" component="h1" gutterBottom>
          Clientes
        </Typography>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          {canEditClient && (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateClient}
              >
                Crear cliente
              </Button>
            </>
          )}
          <TextField
            label="Buscar"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
        <Grid container spacing={2}>
          {filteredClients.map((client) => (
            <Grid item xs={12} sm={6} md={4} key={client.id}>
              <CustomCard>
                <CardContent>
                  <Typography variant="h6">{client.name}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleClientClick(client)}>
                    Ver detalles
                  </Button>
                  {canEditClient && (
                    <>
                      <Button size="small" onClick={() => handleEditClient(client)}>
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedClient(client);
                          handleDeleteConfirmation();
                        }}
                      >
                        Eliminar
                      </Button>
                    </>
                  )}
                </CardActions>
              </CustomCard>
            </Grid>
          ))}
        </Grid>
      </CustomMain>
      {/* Client Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        {selectedClient && (
          <>
            <DialogTitle>{selectedClient.name}</DialogTitle>
          </>
        )}
      </Dialog>

      {/* Create/Edit Client Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog}>
        <DialogTitle>
          {selectedClient ? "Editar cliente" : "Crear cliente"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Nombre"
            name="name"
            value={selectedClient ? selectedClient.name : newClient.name}
            onChange={
              selectedClient ? (e) =>
                setSelectedClient({ ...selectedClient, name: e.target.value })
              : handleInputChange
            }
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancelar</Button>
          {selectedClient ? (
            <Button
              onClick={async () => {
                try {
                  const response = await axiosInstance.put(
                    `/clients/${selectedClient.id}`,
                    selectedClient
                  );
                  fetchClients();
                  handleCloseCreateDialog();
                  setMessageDialogContent(response.data.message);
                  setMessageDialogOpen(true);
                } catch (error) {
                  console.error("Error updating client:", error);
                }
              }}
              color="primary"
              disabled={
                selectedClient.name.trim().length < 2
              }
            >
              Actualizar cliente
            </Button>
          ) : (
            <Button
              onClick={handleCreateSubmit}
              color="primary"
              disabled={isCreateButtonDisabled()}
            >
              Crear cliente
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={openConfirmationDialog}
        onClose={() => setOpenConfirmationDialog(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro que deseas eliminar el cliente "{selectedClient?.name}
            "?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmationDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteClient} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
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

export default ClientPage;