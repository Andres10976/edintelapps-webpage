// UsersPage.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Grid,
  CardContent,
  CardActions,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import Header from "./Header";
import axiosInstance from "../axiosInstance";
import { CustomCard, CustomMain, CustomContainer } from "./styledComponents";
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [openUserForm, setOpenUserForm] = useState(false);
  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
    lastname: "",
    roleId: "",
    phone: null,
    clientId: null,
    siteId: null,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageDialogContent, setMessageDialogContent] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogContent, setErrorDialogContent] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchSites();
  }, []);

  const [userFormTouched, setUserFormTouched] = useState({
    username: false,
    password: false,
    email: false,
    phone: false,
  });

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al obtener los clientes. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const fetchSites = async () => {
    try {
      const token = localStorage.getItem("token");
      let response;
      if (token) {
        response = await axiosInstance.get("/sites");
      }
      const clientsData = response.data.reduce((acc, site) => {
        const existingClient = acc.find(
          (client) => client.id === site.idClient
        );
        if (existingClient) {
          const existingSite = existingClient.sites.find(
            (s) => s.id === site.id
          );
          if (existingSite) {
            existingSite.systems.push({
              id: site.idSystem,
              name: site.systemName,
            });
          } else {
            existingClient.sites.push({
              id: site.id,
              name: site.name,
              systems: [{ id: site.idSystem, name: site.systemName }],
            });
          }
        } else {
          acc.push({
            id: site.idClient,
            name: site.clientName,
            sites: [
              {
                id: site.id,
                name: site.name,
                systems: [{ id: site.idSystem, name: site.systemName }],
              },
            ],
          });
        }
        return acc;
      }, []);
      setClients(clientsData);
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  };

  function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric", timeZone: 'America/Costa_Rica' };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  }

  const confirmDeleteUser = async () => {
    try {
      const response = await axiosInstance.delete(`/users/${selectedUser.id}`);
      fetchUsers();
      setOpenConfirmDelete(false);
      setOpenUserDialog(false);
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al eliminar el usuario. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const isUserFormButtonDisabled = () => {
    const { username, password, email, name, lastname, roleId, phone } = userForm;
  
    return (
      !username ||
      !email ||
      !name ||
      !lastname ||
      !roleId ||
      (phone && !isValidPhone(phone)) ||
      (email && !isValidEmail(email)) ||
      (username && !isValidUsername(username)) ||
      (password && !isValidPassword(password))
    );
  };

  const isValidEmail = (email) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^\d{8}$/;
    return phoneRegex.test(phone);
  };

  const isValidUsername = (username) => {
    if (!username) return true;
    return username.length >= 8;
  };

  const isValidPassword = (password) => {
    if (!password) return true;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
    return passwordRegex.test(password);
  };

  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get("/users/roles");
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al obtener los roles. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const handleUserFormSubmit = async () => {
    try {
      let response;
      if (selectedUser) {
        response = await axiosInstance.put(`/users/${selectedUser.id}`, userForm);
      } else {
        response = await axiosInstance.post("/users", userForm);
      }
      setOpenUserForm(false);
      setUserForm({
        username: "",
        password: "",
        email: "",
        name: "",
        lastname: "",
        roleId: "",
        phone: "",
        clientId: null,
        siteId: null,
      });
      fetchUsers();
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error submitting user form:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al obtener crear o actualizar el usuario. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setOpenConfirmDelete(true);
  };

  const handleResetPassword = async (userId) => {
    try {
      const actualPassword = prompt("Enter the current password:");
      const newPassword = prompt("Enter the new password:");
      const response = await axiosInstance.post(`/users/${userId}/reset-password`, {
        actualPassword,
        newPassword,
      });
      //alert("Password reset successful");
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error resetting password:", error);
      //alert("Password reset failed");
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al restaurar la contraseña. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setOpenUserDialog(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserForm({
      username: user.username,
      password: "",
      email: user.email,
      name: user.name,
      lastname: user.lastname,
      roleId: user.roleId,
      phone: user.phone,
      clientId: user.clientId,
      siteId: user.siteId,
    });
    setOpenUserForm(true);
  };

  const getRoleName = (roleId) => {
    const role = roles.find((role) => role.id === roleId);
    return role ? role.name : "";
  };

  const getClientName = (clientId) => {
    const client = clients.find((client) => client.id === clientId);
    return client ? client.name : "";
  };

  const getSiteName = (clientId, siteId) => {
    const client = clients.find((client) => client.id === clientId);
    if (client) {
      const site = client.sites.find((site) => site.id === siteId);
      return site ? site.name : "";
    }

    return "";
  };

  const filterUsers = () => {
    return users.filter((user) => {
      const { username, email, name, lastname, phone } = user;
      const fullName = `${name} ${lastname}`;
      const lowerCaseQuery = searchQuery.toLowerCase();
      return (
        (username && username.toLowerCase().includes(lowerCaseQuery)) ||
        (email && email.toLowerCase().includes(lowerCaseQuery)) ||
        (fullName && fullName.toLowerCase().includes(lowerCaseQuery)) ||
        (phone && phone.toLowerCase().includes(lowerCaseQuery))
      );
    });
  };

  const getSites = (clientId) => {
    console.log(clientId, userForm.siteId);
    const client = clients.find((client) => client.id === clientId);
    console.log(client.sites);
    return client ? client.sites : [];
  };

  return (
    <CustomContainer>
      <Header />
      <CustomMain>
        <Typography variant="h4" component="h1" gutterBottom>
          Usuarios
        </Typography>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Button
            variant="contained"
            onClick={() => {
              setSelectedUser(null);
              setUserForm({
                username: "",
                password: "",
                email: "",
                name: "",
                lastname: "",
                roleId: "",
                phone: null,
                clientId: null,
              });
              setOpenUserForm(true);
            }}
          >
            Crear nuevo usuario
          </Button>
          <TextField
            label="Buscar"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <Grid container spacing={2}>
          {filterUsers().map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <CustomCard>
                <CardContent>
                  <Typography variant="h6">
                    {user.name} {user.lastname}
                  </Typography>
                  <Typography color="textSecondary">{user.username}</Typography>
                  <Typography color="textSecondary">{user.email}</Typography>
                  <Typography color="textSecondary">
                    {getRoleName(user.roleId)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleUserClick(user)}>
                    Ver detalles
                  </Button>
                  <Button size="small" onClick={() => handleEditUser(user)}>
                    Editar
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDeleteUser(user)}
                  >
                    Eliminar
                  </Button>
                </CardActions>
              </CustomCard>
            </Grid>
          ))}
        </Grid>
      </CustomMain>

      {/* User Details Dialog */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)}>
        <DialogTitle>Detalles del usuario</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>Nombre de usuario:</strong> {selectedUser?.username}
          </Typography>
          <Typography>
            <strong>Email:</strong> {selectedUser?.email}
          </Typography>
          <Typography>
            <strong>Nombre:</strong> {selectedUser?.name}
          </Typography>
          <Typography>
            <strong>Apellido:</strong> {selectedUser?.lastname}
          </Typography>
          {selectedUser?.phone && (
            <Typography>
              <strong>Teléfono:</strong> {selectedUser?.phone}
            </Typography>
          )}
          <Typography>
            <strong>Rol:</strong> {getRoleName(selectedUser?.roleId)}
          </Typography>
          {selectedUser?.roleId === 5 && (
            <Typography>
              <strong>Cliente:</strong> {getClientName(selectedUser?.clientId)}
            </Typography>
          )}
          {(selectedUser?.roleId === 5 && selectedUser?.siteId) && (
            <Typography>
              <strong>Sitio:</strong> {getSiteName(selectedUser?.clientId, selectedUser?.siteId)}
            </Typography>
          )}
          <Typography>
            <strong>Creado en:</strong>{" "}
            {formatDate(selectedUser?.createdAt)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* User Form Dialog */}
      <Dialog open={openUserForm} onClose={() => setOpenUserForm(false)}>
        <DialogTitle>
          {selectedUser ? "Editar usuario" : "Crear nuevo usuario"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre de usuario"
            fullWidth
            margin="normal"
            value={userForm.username}
            onChange={(e) =>
              setUserForm({ ...userForm, username: e.target.value })
            }
            onBlur={() =>
              setUserFormTouched({ ...userFormTouched, username: true })
            }
            error={
              userFormTouched.username && !isValidUsername(userForm.username)
            }
            helperText={
              userFormTouched.username &&
              !isValidUsername(userForm.username) &&
              "El nombre de usuario debe tener al menos 8 caracteres"
            }
          />
          {!selectedUser && (
            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              margin="normal"
              value={userForm.password}
              onChange={(e) =>
                setUserForm({ ...userForm, password: e.target.value })
              }
              onBlur={() =>
                setUserFormTouched({ ...userFormTouched, password: true })
              }
              error={
                userFormTouched.password && !isValidPassword(userForm.password)
              }
              helperText={
                userFormTouched.password &&
                !isValidPassword(userForm.password) &&
                "La contraseña debe tener al menos 8 caracteres, 1 número, 1 letra minúscula y 1 letra mayúscula"
              }
            />
          )}
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={userForm.email}
            onChange={(e) =>
              setUserForm({ ...userForm, email: e.target.value })
            }
            onBlur={() =>
              setUserFormTouched({ ...userFormTouched, email: true })
            }
            error={userFormTouched.email && !isValidEmail(userForm.email)}
            helperText={
              userFormTouched.email &&
              !isValidEmail(userForm.email) &&
              "Email inválido"
            }
          />
          <TextField
            label="Nombre"
            fullWidth
            margin="normal"
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
          />
          <TextField
            label="Apellido"
            fullWidth
            margin="normal"
            value={userForm.lastname}
            onChange={(e) =>
              setUserForm({ ...userForm, lastname: e.target.value })
            }
          />
          <TextField
            label="Teléfono"
            fullWidth
            margin="normal"
            value={userForm.phone}
            onChange={(e) =>
              setUserForm({ ...userForm, phone: e.target.value })
            }
            onBlur={() =>
              setUserFormTouched({ ...userFormTouched, phone: true })
            }
            error={userFormTouched.phone && !isValidPhone(userForm.phone)}
            helperText={
              userFormTouched.phone &&
              !isValidPhone(userForm.phone) &&
              "Teléfono inválido"
            }
          />
          <TextField
            select
            label="Rol"
            fullWidth
            margin="normal"
            value={userForm.roleId}
            onChange={(e) =>
              setUserForm({ ...userForm, roleId: e.target.value })
            }
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </TextField>
          {userForm.roleId === 5 && (
            <>
              <Autocomplete
                options={clients}
                getOptionLabel={(client) => client.name}
                renderInput={(params) => (
                  <TextField {...params} label="Cliente" fullWidth margin="normal" />
                )}
                value={clients.find((client) => client.id === userForm.clientId)}
                onChange={(event, newValue) => {
                  setUserForm({
                    ...userForm,
                    clientId: newValue?.id || null,
                    siteId: null,
                  });
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
              {userForm.clientId && (
                <Autocomplete
                  options={[{ id: null, name: "Sin especificar" }, ...getSites(userForm.clientId)]}
                  getOptionLabel={(site) => site.name}
                  renderInput={(params) => (
                    <TextField {...params} label="Sitio" fullWidth margin="normal" />
                  )}
                  value={
                    userForm.siteId
                      ? getSites(userForm.clientId).find((site) => site.id === userForm.siteId) || { id: null, name: "Sin especificar" }
                      : { id: null, name: "Sin especificar" }
                  }
                  onChange={(event, newValue) => {
                    setUserForm({
                      ...userForm,
                      siteId: newValue?.id || null,
                    });
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              )}
            </>
          )}
          {selectedUser && (
            <Typography variant="subtitle1">
              Creado en: {formatDate(selectedUser.createdAt)}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          {selectedUser && (
            <>
              <Button
                onClick={() => handleResetPassword(selectedUser.id)}
                color="primary"
              >
                Restablecer contraseña
              </Button>
            </>
          )}
          <Button
            onClick={handleUserFormSubmit}
            disabled={isUserFormButtonDisabled()}
          >
            {selectedUser ? "Actualizar" : "Crear"}
          </Button>
          <Button onClick={() => setOpenUserForm(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={openConfirmDelete}
        onClose={() => setOpenConfirmDelete(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este usuario?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDelete(false)}>Cancelar</Button>
          <Button onClick={confirmDeleteUser} color="error">
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

export default UsersPage;