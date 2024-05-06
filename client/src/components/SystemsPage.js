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
  CardContent,
  CardActions,
} from "@mui/material";
import Header from "./Header";
import axiosInstance from "../axiosInstance";
import {CustomCard, CustomMain, CustomContainer} from "./styledComponents"
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function Systems() {
  const [systems, setSystems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [systemForm, setSystemForm] = useState({ name: "" });
  const [openSystemForm, setOpenSystemForm] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageDialogContent, setMessageDialogContent] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogContent, setErrorDialogContent] = useState("");

  useEffect(() => {
    fetchSystems();
  }, []);

  const fetchSystems = async () => {
    try {
      const response = await axiosInstance.get("/systems");
      setSystems(response.data);
    } catch (error) {
      console.error("Error fetching systems:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al obtener los sistemas. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const handleSystemFormSubmit = async () => {
    try {
      let response;
      if (selectedSystem) {
        response = await axiosInstance.put(`/systems/${selectedSystem.id}`, systemForm);
      } else {
        response = await axiosInstance.post("/systems", systemForm);
      }
      setOpenSystemForm(false);
      setSystemForm({ name: "" });
      fetchSystems();
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error submitting system form:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al crear o actualizar un sistema. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const handleDeleteSystem = (system) => {
    setSelectedSystem(system);
    setOpenConfirmDelete(true);
  };

  const confirmDeleteSystem = async () => {
    try {
      const response = await axiosInstance.delete(`/systems/${selectedSystem.id}`);
      fetchSystems();
      setOpenConfirmDelete(false);
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error deleting system:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al eliminar el sistema. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const handleEditSystem = (system) => {
    setSelectedSystem(system);
    setSystemForm({ name: system.name });
    setOpenSystemForm(true);
  };

  const filteredSystems = systems
  .filter((system) =>
    system.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <CustomContainer>
      <Header />
      <CustomMain>
        <Typography variant="h4" component="h1" gutterBottom>
          Sistemas
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
              setSelectedSystem(null);
              setSystemForm({ name: "" });
              setOpenSystemForm(true);
            }}
          >
            Crear nuevo sistema
          </Button>
          <TextField
            label="Buscar"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
        <Grid container spacing={2}>
          {filteredSystems.map((system) => (
            <Grid item xs={12} sm={6} md={4} key={system.id}>
              <CustomCard>
                <CardContent>
                  <Typography variant="h6">{system.name}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleEditSystem(system)}>
                    Editar
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDeleteSystem(system)}
                  >
                    Eliminar
                  </Button>
                </CardActions>
              </CustomCard>
            </Grid>
          ))}
        </Grid>
      </CustomMain>

      {/* System Form Dialog */}
      <Dialog open={openSystemForm} onClose={() => setOpenSystemForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedSystem ? "Editar sistema" : "Crear nuevo sistema"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre del sistema"
            fullWidth
            margin="normal"
            value={systemForm.name}
            onChange={(e) =>
              setSystemForm({ ...systemForm, name: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSystemForm(false)}>Cancelar</Button>
          <Button onClick={handleSystemFormSubmit}>
            {selectedSystem ? "Actualizar" : "Crear"}
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
          <Typography>
            ¿Estás seguro de que deseas eliminar el sistema "
            {selectedSystem?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDelete(false)}>Cancelar</Button>
          <Button onClick={confirmDeleteSystem} color="error">
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

export default Systems;