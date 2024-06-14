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
  MenuItem,
} from "@mui/material";
import Header from "./Header";
import axiosInstance from "../axiosInstance";
import { jwtDecode } from "jwt-decode";
import {CustomCard, CustomMain, CustomContainer} from "./styledComponents"
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function ClientPage() {
  const [buildings, setBuildings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [newBuilding, setNewBuilding] = useState({
    name: "",
    companyId: "",
  });
  const [companies, setCompanies] = useState([]);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageDialogContent, setMessageDialogContent] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogContent, setErrorDialogContent] = useState("");
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    fetchBuildings();
    getRoleFromToken();
    fetchCompanies();
  }, []);

  const fetchBuildings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = jwtDecode(token);
        if (decodedToken.roleId === 5) {
          const response = await axiosInstance.get(`/clients/${decodedToken.clientId}`);
          setBuildings([response.data]);
        } else {
          const response = await axiosInstance.get("/clients");
          const sortedBuildings = response.data.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setBuildings(sortedBuildings);
        }
      }
    } catch (error) {
      console.error("Error fetching buildings:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al obtener los edificios. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get("/companies");
      setCompanies(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al obtener las empresas. Por favor, intente nuevamente.");
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

  const filteredBuildings = buildings.filter((building) => {
    const { name } = building;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  const handleCreateBuilding = () => {
    setOpenCreateDialog(true);
  };

  const handleDeleteConfirmation = () => {
    setOpenConfirmationDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setSelectedBuilding(null);
    setNewBuilding({
      name: "",
      companyId: "",
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewBuilding((prevBuilding) => ({
      ...prevBuilding,
      [name]: value,
    }));
  };

  const handleDeleteBuilding = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.delete(`/clients/${selectedBuilding.id}`);
      fetchBuildings();
      setOpenConfirmationDialog(false);
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error deleting building:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al eliminar el edificio. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    } finally {
      setLoading(false); // Set loading back to false after the API call completes
    }
  };

  const isCreateButtonDisabled = () => {
    const { name, companyId } = newBuilding;
    return (
      name.trim().length < 2 || !companyId
    );
  };

  const handleCreateSubmit = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/clients", newBuilding);
      fetchBuildings();
      handleCloseCreateDialog();
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error creating building:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al crear el edificio. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    } finally {
      setLoading(false); // Set loading back to false after the API call completes
    }
  };

  const canEditBuilding = [1, 2, 3].includes(roleId);

  const handleEditBuilding = (building) => {
    setSelectedBuilding(building);
    setOpenCreateDialog(true);
  };

  const handleEditClient = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(
        `/clients/${selectedBuilding.id}`,
        selectedBuilding
      );
      fetchBuildings();
      handleCloseCreateDialog();
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error updating building:", error);
    } finally {
      setLoading(false); // Set loading back to false after the API call completes
    }
  }

  return (
    <CustomContainer>
      <Header />
      <CustomMain>
        <Typography variant="h4" component="h1" gutterBottom>
          Edificios
        </Typography>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          {canEditBuilding && (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateBuilding}
              >
                Crear edificio
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
          {filteredBuildings.map((building) => (
            <Grid item xs={12} sm={6} md={4} key={building.id}>
              <CustomCard>
                <CardContent>
                  <Typography variant="h6">{building.name}</Typography>
                  <Typography>
                    {companies.find(company => company.id === building.companyId)?.name}
                  </Typography>
                </CardContent>
                <CardActions>
                  {canEditBuilding && (
                    <>
                      <Button size="small" onClick={() => handleEditBuilding(building)}>
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedBuilding(building);
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

      {/* Create/Edit Building Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog}>
        <DialogTitle>
          {selectedBuilding ? "Editar edificio" : "Crear edificio"}
        </DialogTitle>
        <DialogContent>
        <TextField
            fullWidth
            margin="normal"
            label="Empresa"
            name="companyId"
            value={selectedBuilding ? selectedBuilding.companyId : newBuilding.companyId}
            onChange={
              selectedBuilding ? (e) =>
                setSelectedBuilding({ ...selectedBuilding, companyId: e.target.value })
              : handleInputChange
            }
            select
            required
          >
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            margin="normal"
            label="Nombre"
            name="name"
            value={selectedBuilding ? selectedBuilding.name : newBuilding.name}
            onChange={
              selectedBuilding ? (e) =>
                setSelectedBuilding({ ...selectedBuilding, name: e.target.value })
              : handleInputChange
            }
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancelar</Button>
          {selectedBuilding ? (
            <Button
              onClick={handleEditClient}
              color="primary"
              disabled={
                selectedBuilding.name.trim().length < 2 || !selectedBuilding.companyId || loading
              }
            >
              Actualizar edificio
            </Button>
          ) : (
            <Button
              onClick={handleCreateSubmit}
              color="primary"
              disabled={isCreateButtonDisabled() || loading}
            >
              Crear edificio
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
            ¿Estás seguro que deseas eliminar el edificio "{selectedBuilding?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmationDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteBuilding} color="error" disabled={loading}>
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