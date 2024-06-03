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
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
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
        setErrorDialogContent(error.response.data.message || "Error al obtener las compañías. Por favor, intente nuevamente.");
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

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedCompany(null);
    setOpenDialog(false);
  };

  const handleCreateCompany = () => {
    setOpenCreateDialog(true);
  };

  const handleDeleteConfirmation = () => {
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
      const response = await axiosInstance.delete(`/companies/${selectedCompany.id}`);
      fetchCompanies();
      handleCloseDialog();
      setOpenConfirmationDialog(false);
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error deleting company:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al eliminar la compañía. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const isCreateButtonDisabled = () => {
    const { name } = newCompany;
    return name.trim().length < 2;
  };

  const handleCreateSubmit = async () => {
    try {
      const response = await axiosInstance.post("/companies", newCompany);
      fetchCompanies();
      handleCloseCreateDialog();
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error creating company:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al crear la compañía. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const canEditCompany = [1, 2, 3].includes(roleId);

  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setOpenCreateDialog(true);
  };

  return (
    <CustomContainer>
      <Header />
      <CustomMain>
        <Typography variant="h4" component="h1" gutterBottom>
          Compañías
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
                Crear compañía
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
                  <Button size="small" onClick={() => handleCompanyClick(company)}>
                    Ver detalles
                  </Button>
                  {canEditCompany && (
                    <>
                      <Button size="small" onClick={() => handleEditCompany(company)}>
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedCompany(company);
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
      {/* Company Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        {selectedCompany && (
          <>
            <DialogTitle>{selectedCompany.name}</DialogTitle>
          </>
        )}
      </Dialog>

      {/* Create/Edit Company Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog}>
        <DialogTitle>
          {selectedCompany ? "Editar compañía" : "Crear compañía"}
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
              onClick={async () => {
                try {
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
                }
              }}
              color="primary"
              disabled={selectedCompany.name.trim().length < 2}
            >
              Actualizar compañía
            </Button>
          ) : (
            <Button
              onClick={handleCreateSubmit}
              color="primary"
              disabled={isCreateButtonDisabled()}
            >
              Crear compañía
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
            ¿Estás seguro que deseas eliminar la compañía "{selectedCompany?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmationDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteCompany} color="error">
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