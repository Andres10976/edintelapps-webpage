// Systems.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { styled } from "@mui/system";
import Header from "./Header";
import axiosInstance from "../axiosInstance";

const SystemsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
}));

const Main = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(4),
}));

function Systems() {
  const [systems, setSystems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [systemName, setSystemName] = useState("");
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [systemToDelete, setSystemToDelete] = useState(null);
  const [createSystemOpen, setCreateSystemOpen] = useState(false);
  const [deleteSystemConfirmationOpen, setDeleteSystemConfirmationOpen] =
    useState(false);

  useEffect(() => {
    fetchSystems();
  }, []);

  const fetchSystems = async () => {
    try {
      const response = await axiosInstance.get("/systems");
      setSystems(response.data);
    } catch (error) {
      console.error("Error fetching systems:", error);
    }
  };

  const createSystem = async () => {
    try {
      await axiosInstance.post("/systems", { name: systemName });
      setSystemName("");
      fetchSystems();
      setCreateSystemOpen(false);
    } catch (error) {
      console.error("Error creating system:", error);
    }
  };

  const updateSystem = async () => {
    try {
      await axiosInstance.put(`/systems/${selectedSystem.id}`, {
        name: selectedSystem.name,
      });
      fetchSystems();
      setSelectedSystem(null);
    } catch (error) {
      console.error("Error updating system:", error);
    }
  };

  const deleteSystem = async () => {
    try {
      await axiosInstance.delete(`/systems/${systemToDelete.id}`);
      fetchSystems();
      setSystemToDelete(null);
      setDeleteSystemConfirmationOpen(false);
    } catch (error) {
      console.error("Error deleting system:", error);
    }
  };

  const openCreateSystem = () => {
    setCreateSystemOpen(true);
  };

  const closeCreateSystem = () => {
    setCreateSystemOpen(false);
    setSystemName("");
  };

  const openDeleteSystemConfirmation = (system) => {
    setSystemToDelete(system);
    setDeleteSystemConfirmationOpen(true);
  };

  const closeDeleteSystemConfirmation = () => {
    setDeleteSystemConfirmationOpen(false);
    setSystemToDelete(null);
  };

  const filteredSystems = systems.filter((system) =>
    system.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SystemsContainer>
      <Header />
      <Main>
        <Typography variant="h4" component="h1" gutterBottom>
          Sistemas
        </Typography>

        <Box mb={4} display="flex" alignItems="center">
          <TextField
            label="Buscar sistema"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ mr: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={openCreateSystem}
          >
            Crear sistema
          </Button>
        </Box>

        <Grid container spacing={2}>
          {filteredSystems.map((system) => (
            <Grid item xs={12} sm={6} md={4} key={system.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {system.name}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => setSelectedSystem(system)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={() => openDeleteSystemConfirmation(system)}
                  >
                    Eliminar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Main>

      <Dialog open={createSystemOpen} onClose={closeCreateSystem}>
        <DialogTitle>Crear sistema</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              label="Nombre del sistema"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              variant="outlined"
              size="small"
              required
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateSystem} color="primary">
            Cancelar
          </Button>
          <Button onClick={createSystem} color="primary" autoFocus>
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={selectedSystem !== null}
        onClose={() => setSelectedSystem(null)}
      >
        <DialogTitle>Editar sistema</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              label="Nombre del sistema"
              value={selectedSystem?.name || ""}
              onChange={(e) =>
                setSelectedSystem({ ...selectedSystem, name: e.target.value })
              }
              variant="outlined"
              size="small"
              required
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedSystem(null)} color="primary">
            Cancelar
          </Button>
          <Button onClick={updateSystem} color="primary" autoFocus>
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteSystemConfirmationOpen}
        onClose={closeDeleteSystemConfirmation}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el sistema "
            {systemToDelete?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteSystemConfirmation} color="primary">
            Cancelar
          </Button>
          <Button onClick={deleteSystem} color="secondary" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </SystemsContainer>
  );
}

export default Systems;
