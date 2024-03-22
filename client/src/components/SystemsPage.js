// Systems.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { styled } from '@mui/system';
import Header from './Header';
import axiosInstance from '../axiosInstance';

const SystemsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
}));

const Main = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(4),
}));

function Systems() {
  const [systems, setSystems] = useState([]);
  const [systemName, setSystemName] = useState('');
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [selectedSystemType, setSelectedSystemType] = useState(null);
  const [systemTypes, setSystemTypes] = useState([]);
  const [systemTypeName, setSystemTypeName] = useState('');
  const [deleteSystemConfirmationOpen, setDeleteSystemConfirmationOpen] = useState(false);
  const [deleteSystemTypeConfirmationOpen, setDeleteSystemTypeConfirmationOpen] = useState(false);

  useEffect(() => {
    fetchSystems();
  }, []);

  const fetchSystems = async () => {
    try {
      const response = await axiosInstance.get('/systems');
      setSystems(response.data);
    } catch (error) {
      console.error('Error fetching systems:', error);
    }
  };

  const createSystem = async () => {
    try {
      await axiosInstance.post('/systems', { name: systemName });
      setSystemName('');
      fetchSystems();
    } catch (error) {
      console.error('Error creating system:', error);
    }
  };

  const updateSystem = async () => {
    try {
      await axiosInstance.put(`/systems/${selectedSystem.id}`, {
        name: selectedSystem.name,
      });
      fetchSystems();
    } catch (error) {
      console.error('Error updating system:', error);
    }
  };

  const deleteSystem = async () => {
    try {
      await axiosInstance.delete(`/systems/${selectedSystem.id}`);
      fetchSystems();
      setSelectedSystem(null);
      setDeleteSystemConfirmationOpen(false);
    } catch (error) {
      console.error('Error deleting system:', error);
    }
  };

  const fetchSystemTypes = async (systemId) => {
    try {
      const response = await axiosInstance.get(`/systems/${systemId}/types`);
      setSystemTypes(response.data);
    } catch (error) {
      console.error('Error fetching system types:', error);
    }
  };

  const createSystemType = async () => {
    try {
      await axiosInstance.post(`/systems/${selectedSystem.id}/types`, {
        name: systemTypeName,
      });
      setSystemTypeName('');
      fetchSystemTypes(selectedSystem.id);
    } catch (error) {
      console.error('Error creating system type:', error);
    }
  };

  const updateSystemType = async () => {
    try {
      await axiosInstance.put(`/systems/${selectedSystem.id}/types/${selectedSystemType.id}`, {
        name: selectedSystemType.name,
      });
      fetchSystemTypes(selectedSystem.id);
      setSelectedSystemType(null);
    } catch (error) {
      console.error('Error updating system type:', error);
    }
  };

  const deleteSystemType = async () => {
    try {
      await axiosInstance.delete(`/systems/${selectedSystem.id}/types/${selectedSystemType.id}`);
      fetchSystemTypes(selectedSystem.id);
      setSelectedSystemType(null);
      setDeleteSystemTypeConfirmationOpen(false);
    } catch (error) {
      console.error('Error deleting system type:', error);
    }
  };

  const openDeleteSystemConfirmation = () => {
    setDeleteSystemConfirmationOpen(true);
  };

  const closeDeleteSystemConfirmation = () => {
    setDeleteSystemConfirmationOpen(false);
  };

  const openDeleteSystemTypeConfirmation = () => {
    setDeleteSystemTypeConfirmationOpen(true);
  };

  const closeDeleteSystemTypeConfirmation = () => {
    setDeleteSystemTypeConfirmationOpen(false);
  };

  return (
    <SystemsContainer>
      <Header />
      <Main>
        <Typography variant="h4" component="h1" gutterBottom>
          Sistemas
        </Typography>

        <Box mb={4}>
          <TextField
            label="Nombre del sistema"
            value={systemName}
            onChange={(e) => setSystemName(e.target.value)}
            variant="outlined"
            size="small"
          />
          <Button variant="contained" color="primary" onClick={createSystem} style={{ marginLeft: '1rem' }}>
            Crear sistema
          </Button>
        </Box>

        <Box mb={4}>
          <Typography variant="h6" component="h2" gutterBottom>
            Sistemas activos
          </Typography>
          {systems.map((system) => (
            <Box key={system.id} mb={2}>
              <Typography variant="subtitle1">{system.name}</Typography>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => {
                  setSelectedSystem(system);
                  fetchSystemTypes(system.id);
                }}
              >
                Editar
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={openDeleteSystemConfirmation}
                style={{ marginLeft: '0.5rem' }}
              >
                Eliminar
              </Button>
            </Box>
          ))}
        </Box>

        {selectedSystem && (
          <>
            <Box mb={4}>
              <Typography variant="h6" component="h2" gutterBottom>
                Editar sistema
              </Typography>
              <TextField
                label="Nombre del sistema"
                value={selectedSystem.name}
                onChange={(e) => setSelectedSystem({ ...selectedSystem, name: e.target.value })}
                variant="outlined"
                size="small"
              />
              <Button variant="contained" color="primary" onClick={updateSystem} style={{ marginLeft: '1rem' }}>
                Actualizar sistema
              </Button>
            </Box>

            <Box mb={4}>
              <Typography variant="h6" component="h2" gutterBottom>
                Tipos de sistema
              </Typography>
              {systemTypes.map((type) => (
                <Box key={type.id} mb={2}>
                  <Typography variant="subtitle1">{type.name}</Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => setSelectedSystemType(type)}
                  >
                    Editar
                  </Button>
                </Box>
              ))}
              <TextField
                label="Nombre del tipo de sistema"
                value={systemTypeName}
                onChange={(e) => setSystemTypeName(e.target.value)}
                variant="outlined"
                size="small"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={createSystemType}
                style={{ marginLeft: '1rem' }}
              >
                Crear tipo de sistema
              </Button>
            </Box>

            {selectedSystemType && (
              <Box mb={4}>
                <Typography variant="h6" component="h2" gutterBottom>
                  Editar tipo de sistema
                </Typography>
                <TextField
                  label="Nombre del tipo de sistema"
                  value={selectedSystemType.name}
                  onChange={(e) => setSelectedSystemType({ ...selectedSystemType, name: e.target.value })}
                  variant="outlined"
                  size="small"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={updateSystemType}
                  style={{ marginLeft: '1rem' }}
                >
                  Actualizar tipo de sistema
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={openDeleteSystemTypeConfirmation}
                  style={{ marginLeft: '1rem' }}
                >
                  Eliminar tipo de sistema
                </Button>
              </Box>
            )}
          </>
        )}
      </Main>

      <Dialog open={deleteSystemConfirmationOpen} onClose={closeDeleteSystemConfirmation}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar el sistema "{selectedSystem?.name}"?</Typography>
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

      <Dialog open={deleteSystemTypeConfirmationOpen} onClose={closeDeleteSystemTypeConfirmation}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar el tipo de sistema "{selectedSystemType?.name}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteSystemTypeConfirmation} color="primary">
            Cancelar
          </Button>
          <Button onClick={deleteSystemType} color="secondary" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </SystemsContainer>
  );
}

export default Systems;