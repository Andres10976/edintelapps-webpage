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
    phone: "",
    email: "",
    contactName: "",
    contactLastName: "",
    contactPhone: "",
    contactEmail: "",
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
          setClients(response.data);
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
    const { name, email, contactName, contactLastName } = client;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(lowerCaseSearchTerm) ||
      (email && email.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (contactName &&
        contactName.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (contactLastName &&
        contactLastName.toLowerCase().includes(lowerCaseSearchTerm))
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
      phone: "",
      email: "",
      contactName: "",
      contactLastName: "",
      contactPhone: "",
      contactEmail: "",
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
    const { name, email, phone, contactEmail, contactPhone } = newClient;
    return (
      name.trim().length < 2 ||
      (email && !isValidEmail(email)) ||
      (phone && !isValidPhone(phone)) ||
      (contactEmail && !isValidEmail(contactEmail)) ||
      (contactPhone && !isValidPhone(contactPhone))
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

  const isValidEmail = (email) => {
    // Simple email validation regex pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const isValidPhone = (phone) => {
    // Simple phone validation regex pattern
    const phonePattern = /^\d{8}$/;
    return phonePattern.test(phone);
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
            <DialogContent>
              {selectedClient.phone && (
                <Typography>
                  <strong>Teléfono:</strong> {selectedClient.phone}
                </Typography>
              )}
              {selectedClient.email && (
                <Typography>
                  <strong>Email:</strong> {selectedClient.email}
                </Typography>
              )}
              {selectedClient.contactName && (
                <Typography>
                  <strong>Nombre del contacto:</strong>{" "}
                  {selectedClient.contactName}
                </Typography>
              )}
              {selectedClient.contactLastName && (
                <Typography>
                  <strong>Apellido del contacto:</strong>{" "}
                  {selectedClient.contactLastName}
                </Typography>
              )}
              {selectedClient.contactPhone && (
                <Typography>
                  <strong>Teléfono del contacto:</strong>{" "}
                  {selectedClient.contactPhone}
                </Typography>
              )}
              {selectedClient.contactEmail && (
                <Typography>
                  <strong>Email del contacto:</strong>{" "}
                  {selectedClient.contactEmail}
                </Typography>
              )}
            </DialogContent>
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
          <TextField
            fullWidth
            margin="normal"
            label="Teléfono"
            name="phone"
            value={selectedClient ? selectedClient.phone : newClient.phone}
            onChange={
              selectedClient ? (e) =>
                setSelectedClient({ ...selectedClient, phone: e.target.value })
              : handleInputChange
            }
            error={
              (selectedClient
                ? selectedClient.phone
                : newClient.phone && !isValidPhone(newClient.phone)) &&
              !isValidPhone(
                selectedClient ? selectedClient.phone : newClient.phone
              )
            }
            helperText={
              (selectedClient
                ? selectedClient.phone
                : newClient.phone && !isValidPhone(newClient.phone)) &&
              !isValidPhone(
                selectedClient ? selectedClient.phone : newClient.phone
              )
                ? "Número de teléfono inválido"
                : ""
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            value={selectedClient ? selectedClient.email : newClient.email}
            onChange={
              selectedClient ? (e) =>
                setSelectedClient({ ...selectedClient, email: e.target.value })
              : handleInputChange
            }
            error={
              (selectedClient
                ? selectedClient.email
                : newClient.email && !isValidEmail(newClient.email)) &&
              !isValidEmail(
                selectedClient ? selectedClient.email : newClient.email
              )
            }
            helperText={
              (selectedClient
                ? selectedClient.email
                : newClient.email && !isValidEmail(newClient.email)) &&
              !isValidEmail(
                selectedClient ? selectedClient.email : newClient.email
              )
                ? "Email inválido"
                : ""
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Nombre del contacto"
            name="contactName"
            value={
              selectedClient
                ? selectedClient.contactName
                : newClient.contactName
            }
            onChange={
              selectedClient ? (e) =>
                setSelectedClient({
                  ...selectedClient,
                  contactName: e.target.value,
                })
              : handleInputChange
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Apellido del contacto"
            name="contactLastName"
            value={
              selectedClient
                ? selectedClient.contactLastName
                : newClient.contactLastName
            }
            onChange={
              selectedClient ? (e) =>
                setSelectedClient({
                  ...selectedClient,
                  contactLastName: e.target.value,
                })
              : handleInputChange
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Teléfono del contacto"
            name="contactPhone"
            value={
              selectedClient
                ? selectedClient.contactPhone
                : newClient.contactPhone
            }
            onChange={
              selectedClient ? (e) =>
                setSelectedClient({
                  ...selectedClient,
                  contactPhone: e.target.value,
                })
              : handleInputChange
            }
            error={
              (selectedClient
                ? selectedClient.contactPhone
                : newClient.contactPhone &&
                  !isValidPhone(newClient.contactPhone)) &&
              !isValidPhone(
                selectedClient
                  ? selectedClient.contactPhone
                  : newClient.contactPhone
              )
            }
            helperText={
              (selectedClient
                ? selectedClient.contactPhone
                : newClient.contactPhone &&
                  !isValidPhone(newClient.contactPhone)) &&
              !isValidPhone(
                selectedClient
                  ? selectedClient.contactPhone
                  : newClient.contactPhone
              )
                ? "Número de teléfono del contacto inválido"
                : ""
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email del contacto"
            name="contactEmail"
            value={
              selectedClient
                ? selectedClient.contactEmail
                : newClient.contactEmail
            }
            onChange={
              selectedClient ? (e) =>
                setSelectedClient({
                  ...selectedClient,
                  contactEmail: e.target.value,
                })
              : handleInputChange
            }
            error={
              (selectedClient
                ? selectedClient.contactEmail
                : newClient.contactEmail &&
                  !isValidEmail(newClient.contactEmail)) &&
              !isValidEmail(
                selectedClient
                  ? selectedClient.contactEmail
                  : newClient.contactEmail
              )
            }
            helperText={
              (selectedClient
                ? selectedClient.contactEmail
                : newClient.contactEmail &&
                  !isValidEmail(newClient.contactEmail)) &&
              !isValidEmail(
                selectedClient
                  ? selectedClient.contactEmail
                  : newClient.contactEmail
              )
                ? "Email del contacto inválido"
                : ""
            }
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
                selectedClient.name.trim().length < 2 ||
                (selectedClient.email && !isValidEmail(selectedClient.email)) ||
                (selectedClient.phone && !isValidPhone(selectedClient.phone)) ||
                (selectedClient.contactEmail &&
                  !isValidEmail(selectedClient.contactEmail)) ||
                (selectedClient.contactPhone &&
                  !isValidPhone(selectedClient.contactPhone))
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
        <DialogTitle>
        Confirmar eliminación</DialogTitle>
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