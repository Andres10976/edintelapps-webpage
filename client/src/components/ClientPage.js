// ClientPage.js
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
import { styled } from "@mui/system";
import Header from "./Header";
import axiosInstance from "../axiosInstance";
import { jwtDecode } from "jwt-decode";

const ClientPageContainer = styled(Box)(({ theme }) => ({
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

const ClientCard = styled(Card)(({ theme }) => ({
  cursor: "pointer",
  transition: "background-color 0.3s",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

function ClientPage() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    email: "",
    contactName: "",
    contactLastName: "",
    contactPhone: "",
    contactEmail: "",
  });
  const [roleId, setRoleId] = useState(null);

  useEffect(() => {
    fetchClients();
    getRoleFromToken();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axiosInstance.get("/clients");
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const getRoleFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setRoleId(decodedToken.roleId);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
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

  const handleSelectedClientChange = (event) => {
    const { name, value } = event.target;
    setSelectedClient((prevClient) => ({
      ...prevClient,
      [name]: value,
    }));
  };

  const handleUpdateClient = async () => {
    try {
      await axiosInstance.put(`/clients/${selectedClient.id}`, selectedClient);
      fetchClients();
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  const isUpdateButtonDisabled = () => {
    const { name, email, phone, contactEmail, contactPhone } = selectedClient;
    return (
      name.trim().length < 2 ||
      (email && !isValidEmail(email)) ||
      (phone && !isValidPhone(phone)) ||
      (contactEmail && !isValidEmail(contactEmail)) ||
      (contactPhone && !isValidPhone(contactPhone))
    );
  };

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
      await axiosInstance.delete(`/clients/${selectedClient.id}`);
      fetchClients();
      handleCloseDialog();
      setOpenConfirmationDialog(false);
    } catch (error) {
      console.error("Error deleting client:", error);
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
      await axiosInstance.post("/clients", newClient);
      fetchClients();
      handleCloseCreateDialog();
    } catch (error) {
      console.error("Error creating client:", error);
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
    <ClientPageContainer>
      <Header />
      <Main>
        <Typography variant="h4" component="h1" gutterBottom>
          Clientes
        </Typography>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <SearchBox
            label="Buscar clientes"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateClient}
          >
            Crear cliente
          </Button>
        </Box>
        <Grid container spacing={2}>
          {filteredClients.map((client) => (
            <Grid item xs={12} sm={6} md={4} key={client.id}>
              <ClientCard onClick={() => handleClientClick(client)}>
                <CardContent>
                  <Typography variant="h6">{client.name}</Typography>
                  {client.email && (
                    <Typography color="textSecondary">
                      {client.email}
                    </Typography>
                  )}
                  {client.phone && (
                    <Typography color="textSecondary">
                      {client.phone}
                    </Typography>
                  )}
                  {canEditClient && (
                    <Box mt={1}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleEditClient(client);
                        }}
                        style={{ marginRight: "1rem" }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedClient(client);
                          handleDeleteConfirmation();
                        }}
                      >
                        Eliminar
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </ClientCard>
            </Grid>
          ))}
        </Grid>
      </Main>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        {selectedClient && (
          <>
            <DialogTitle>{selectedClient.name}</DialogTitle>
            <DialogContent>
              <Typography>
                <strong>Teléfono:</strong> {selectedClient.phone}
              </Typography>
              <Typography>
                <strong>Email:</strong> {selectedClient.email}
              </Typography>
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
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
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
              selectedClient ? handleSelectedClientChange : handleInputChange
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
              selectedClient ? handleSelectedClientChange : handleInputChange
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
              selectedClient ? handleSelectedClientChange : handleInputChange
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
              selectedClient ? handleSelectedClientChange : handleInputChange
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
              selectedClient ? handleSelectedClientChange : handleInputChange
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Número de teléfono del contacto"
            name="contactPhone"
            value={
              selectedClient
                ? selectedClient.contactPhone
                : newClient.contactPhone
            }
            onChange={
              selectedClient ? handleSelectedClientChange : handleInputChange
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
              selectedClient ? handleSelectedClientChange : handleInputChange
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
              onClick={handleUpdateClient}
              color="primary"
              disabled={isUpdateButtonDisabled()}
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
          <Button onClick={handleDeleteClient} color="secondary">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </ClientPageContainer>
  );
}

export default ClientPage;
