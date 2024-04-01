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
  Card,
  CardContent,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/system";
import Header from "./Header";
import axiosInstance from "../axiosInstance";

const UsersContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
}));

const Main = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(4),
}));

const UserCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  cursor: "pointer",
}));

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
    lastname: "",
    roleId: "",
    phone: "",
  });
  const [updateUser, setUpdateUser] = useState({
    username: "",
    email: "",
    name: "",
    lastname: "",
    roleId: "",
    phone: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const [newUserTouched, setNewUserTouched] = useState({
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
    }
  };

  function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  const confirmDeleteUser = async () => {
    try {
      await axiosInstance.delete(`/users/${selectedUser.id}`);
      fetchUsers();
      setOpenConfirmDelete(false);
      setOpenUpdateDialog(false);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const isCreateButtonDisabled = () => {
    const { username, password, email, name, lastname, roleId, phone } =
      newUser;
    return (
      !username ||
      !password ||
      !email ||
      !name ||
      !lastname ||
      !roleId ||
      !phone ||
      !isValidEmail(email) ||
      !isValidPhone(phone) ||
      !isValidUsername(username) ||
      !isValidPassword(password)
    );
  };

  const isUpdateButtonDisabled = () => {
    const { username, email, name, lastname, roleId, phone } = updateUser;
    return (
      !username ||
      !email ||
      !name ||
      !lastname ||
      !roleId ||
      !phone ||
      !isValidEmail(email) ||
      !isValidPhone(phone) ||
      !isValidUsername(username)
    );
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    const phoneRegex = /^\d{8}$/;
    return phoneRegex.test(phone);
  };

  const isValidUsername = (username) => {
    return username.length >= 8;
  };

  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
    return passwordRegex.test(password);
  };

  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get("/users/roles");
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleCreateUser = async () => {
    try {
      await axiosInstance.post("/users", newUser);
      setOpenCreateDialog(false);
      setNewUser({
        username: "",
        password: "",
        email: "",
        name: "",
        lastname: "",
        roleId: "",
        phone: "",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleUpdateUser = async () => {
    try {
      await axiosInstance.put(`/users/${selectedUser.id}`, updateUser);
      setOpenUpdateDialog(false);
      setUpdateUser({
        username: "",
        email: "",
        name: "",
        lastname: "",
        roleId: "",
        phone: "",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    setOpenConfirmDelete(true);
  };

  const handleResetPassword = async (userId) => {
    try {
      const actualPassword = prompt("Enter the current password:");
      const newPassword = prompt("Enter the new password:");
      await axiosInstance.post(`/users/${userId}/reset-password`, {
        actualPassword,
        newPassword,
      });
      alert("Password reset successful");
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Password reset failed");
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setUpdateUser({
      username: user.username,
      email: user.email,
      name: user.name,
      lastname: user.lastname,
      roleId: user.roleId,
      phone: user.phone,
    });
    setOpenUpdateDialog(true);
  };

  const getRoleName = (roleId) => {
    const role = roles.find((role) => role.id === roleId);
    return role ? role.name : "";
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

  return (
    <UsersContainer>
      <Header />
      <Main>
        <Typography variant="h4" component="h1" gutterBottom>
          Usuarios
        </Typography>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Button variant="contained" onClick={() => setOpenCreateDialog(true)}>
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
              <UserCard onClick={() => handleUserClick(user)}>
                <CardContent>
                  <Typography variant="h6">
                    {user.name} {user.lastname}
                  </Typography>
                  <Typography variant="subtitle1">{user.username}</Typography>
                  <Typography variant="subtitle2">{user.email}</Typography>
                  <Typography variant="subtitle2">
                    {getRoleName(user.roleId)}
                  </Typography>
                </CardContent>
              </UserCard>
            </Grid>
          ))}
        </Grid>
      </Main>

      {/* Create User Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
      >
        <DialogTitle>Crear nuevo usuario</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre de usuario"
            fullWidth
            margin="normal"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
            onBlur={() =>
              setNewUserTouched({ ...newUserTouched, username: true })
            }
            error={
              newUserTouched.username && !isValidUsername(newUser.username)
            }
            helperText={
              newUserTouched.username &&
              !isValidUsername(newUser.username) &&
              "El nombre de usuario debe tener al menos 8 caracteres"
            }
          />
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            margin="normal"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            onBlur={() =>
              setNewUserTouched({ ...newUserTouched, password: true })
            }
            error={
              newUserTouched.password && !isValidPassword(newUser.password)
            }
            helperText={
              newUserTouched.password &&
              !isValidPassword(newUser.password) &&
              "La contraseña debe tener al menos 8 caracteres, 1 número, 1 letra minúscula y 1 letra mayúscula"
            }
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            onBlur={() => setNewUserTouched({ ...newUserTouched, email: true })}
            error={newUserTouched.email && !isValidEmail(newUser.email)}
            helperText={
              newUserTouched.email &&
              !isValidEmail(newUser.email) &&
              "Email inválido"
            }
          />
          <TextField
            label="Nombre"
            fullWidth
            margin="normal"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <TextField
            label="Apellido"
            fullWidth
            margin="normal"
            value={newUser.lastname}
            onChange={(e) =>
              setNewUser({ ...newUser, lastname: e.target.value })
            }
          />
          <TextField
            select
            label="Rol"
            fullWidth
            margin="normal"
            value={newUser.roleId}
            onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Teléfono"
            fullWidth
            margin="normal"
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            onBlur={() => setNewUserTouched({ ...newUserTouched, phone: true })}
            error={newUserTouched.phone && !isValidPhone(newUser.phone)}
            helperText={
              newUserTouched.phone &&
              !isValidPhone(newUser.phone) &&
              "Teléfono inválido"
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleCreateUser}
            disabled={isCreateButtonDisabled()}
          >
            Crear usuario
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update User Dialog */}
      <Dialog
        open={openUpdateDialog}
        onClose={() => setOpenUpdateDialog(false)}
      >
        <DialogTitle>Update User</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre de usuario"
            fullWidth
            margin="normal"
            value={updateUser.username}
            onChange={(e) =>
              setUpdateUser({ ...updateUser, username: e.target.value })
            }
            error={!isValidUsername(updateUser.username)}
            helperText={
              !isValidUsername(updateUser.username) &&
              "El nombre de usuario debe tener al menos 8 caracteres"
            }
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={updateUser.email}
            onChange={(e) =>
              setUpdateUser({ ...updateUser, email: e.target.value })
            }
            error={!isValidEmail(updateUser.email)}
            helperText={!isValidEmail(updateUser.email) && "Email inválido"}
          />
          <TextField
            label="Nombre"
            fullWidth
            margin="normal"
            value={updateUser.name}
            onChange={(e) =>
              setUpdateUser({ ...updateUser, name: e.target.value })
            }
          />
          <TextField
            label="Apellido"
            fullWidth
            margin="normal"
            value={updateUser.lastname}
            onChange={(e) =>
              setUpdateUser({ ...updateUser, lastname: e.target.value })
            }
          />
          <TextField
            select
            label="Rol"
            fullWidth
            margin="normal"
            value={updateUser.roleId}
            onChange={(e) =>
              setUpdateUser({ ...updateUser, roleId: e.target.value })
            }
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Teléfono"
            fullWidth
            margin="normal"
            value={updateUser.phone}
            onChange={(e) =>
              setUpdateUser({ ...updateUser, phone: e.target.value })
            }
            error={!isValidPhone(updateUser.phone)}
            helperText={!isValidPhone(updateUser.phone) && "Teléfono inválido"}
          />
          <Typography variant="subtitle1">
            Creado en: {formatDate(selectedUser?.createdAt)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleDeleteUser(selectedUser.id)}
            color="secondary"
          >
            Eliminar
          </Button>
          <Button onClick={() => handleResetPassword(selectedUser.id)}>
            Restablecer contraseña
          </Button>
          <Button
            onClick={handleUpdateUser}
            disabled={isUpdateButtonDisabled()}
          >
            Actualizar
          </Button>
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
    </UsersContainer>
  );
}

export default UsersPage;
