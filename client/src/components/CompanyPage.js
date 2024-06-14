// CompanyPage.js
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
import { CustomCard, CustomMain, CustomContainer } from "./styledComponents";
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function CompanyPage() {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [newCompany, setNewCompany] = useState({
    name: "",
  });
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageDialogContent, setMessageDialogContent] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogContent, setErrorDialogContent] = useState("");
  const [selectedCompany, setSelectedCompany] = useState({
    name: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
    getRoleFromToken();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get("/companies");
      const sortedCompanies = response.data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setCompanies(sortedCompanies);
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

  const filteredCompanies = companies.filter((company) => {
    const { name } = company;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return name.toLowerCase().includes(lowerCaseSearchTerm);
  });

  const handleCreateCompany = () => {
    setSelectedCompany(null);
    setOpenCreateDialog(true);
  };

  const handleDeleteConfirmation = (company) => {
    setSelectedCompany(company);
    setOpenConfirmationDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setSelectedCompany(null);
    setNewCompany({
      name: "",
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewCompany((prevCompany) => ({
      ...prevCompany,
      [name]: value,
    }));
  };

  const handleDeleteCompany = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.delete(`/companies/${selectedCompany.id}`);
      fetchCompanies();
      setOpenConfirmationDialog(false);
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error deleting company:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al eliminar la empresa. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    } finally {
      setLoading(false); // Set loading back to false after the API call completes
    }
  };

  const isCreateButtonDisabled = () => {
    const { name } = newCompany;
    return name.trim().length < 2;
  };

  const handleCreateSubmit = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/companies", newCompany);
      fetchCompanies();
      handleCloseCreateDialog();
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error creating company:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al crear la empresa. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    } finally {
      setLoading(false); // Set loading back to false after the API call completes
    }
  };

  const canEditCompany = [1, 2, 3].includes(roleId);

  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setOpenCreateDialog(true);
  };

  const handleConfirmEditCompany = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(
        `/companies/${selectedCompany.id}`,
        selectedCompany
      );
      fetchCompanies();
      handleCloseCreateDialog();
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error updating company:", error);
    } finally {
      setLoading(false); // Set loading back to false after the API call completes
    }
  }

  return (
    <CustomContainer>
      <Header />
      <CustomMain>
        <Typography variant="h4" component="h1" gutterBottom>
        Empresas
        </Typography>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          {canEditCompany && (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateCompany}
              >
                Crear empresa
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
          {filteredCompanies.map((company) => (
            <Grid item xs={12} sm={6} md={4} key={company.id}>
              <CustomCard>
                <CardContent>
                  <Typography variant="h6">{company.name}</Typography>
                </CardContent>
                <CardActions>
                  {canEditCompany && (
                    <>
                      <Button size="small" onClick={() => handleEditCompany(company)}>
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteConfirmation(company)}
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

      {/* Create/Edit Company Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog}>
        <DialogTitle>
          {selectedCompany ? "Editar empresa" : "Crear empresa"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Nombre"
            name="name"
            value={selectedCompany ? selectedCompany.name : newCompany.name}
            onChange={
              selectedCompany
                ? (e) => setSelectedCompany({ ...selectedCompany, name: e.target.value })
                : handleInputChange
            }
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancelar</Button>
          {selectedCompany ? (
            <Button
              onClick={handleConfirmEditCompany}
              color="primary"
              disabled={selectedCompany.name.trim().length < 2 || loading}
            >
              Actualizar empresa
            </Button>
          ) : (
            <Button
              onClick={handleCreateSubmit}
              color="primary"
              disabled={isCreateButtonDisabled() || loading}
            >
              Crear empresa
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
            ¿Estás seguro que deseas eliminar la empresa "{selectedCompany?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmationDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteCompany} color="error" disabled={loading}>
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

export default CompanyPage;