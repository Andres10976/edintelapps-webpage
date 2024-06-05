// SitesPage.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Autocomplete,
} from "@mui/material";
import { styled } from "@mui/system";
import Header from "./Header";
import axiosInstance from "../axiosInstance";
import { jwtDecode } from "jwt-decode";
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const SitesContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
}));

const Main = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(4),
}));

const SiteCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

function SitesPage() {
  const [sites, setSites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSite, setSelectedSite] = useState(null);
  const [openSiteDialog, setOpenSiteDialog] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [openSiteForm, setOpenSiteForm] = useState(false);
  const [siteForm, setSiteForm] = useState({
    idCompany: "",
    idClient: "",
    name: "",
    supervisor: "",
    contactName: "",
    contactMail: "",
    contactPhone: "",
    address: "",
  });
  const [supervisors, setSupervisors] = useState([]);
  const [clients, setClients] = useState([]);
  const [systems, setSystems] = useState([]);
  const [selectedSystems, setSelectedSystems] = useState([]);
  const [roleId, setRoleId] = useState(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageDialogContent, setMessageDialogContent] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogContent, setErrorDialogContent] = useState("");
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    getRoleFromToken();
    fetchSites();
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (roleId !== 5 && roleId !== null) {
      fetchSupervisors();
      fetchClients();
      fetchSystems();
    }
  }, [roleId]);

  const getRoleFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setRoleId(decodedToken.roleId);
    }
  };

  const canEditRequest = [1, 2, 3].includes(roleId);

  const fetchSites = async () => {
    try {
      const token = localStorage.getItem("token");
      let response;
      if (token) {
        const decodedToken = jwtDecode(token);
        if (decodedToken.roleId === 5) {
          response = await axiosInstance.get(`/clients/${decodedToken.clientId}/sites`);
        } else {
          response = await axiosInstance.get("/sites");
        }
      }
      const groupedSites = response.data.reduce((acc, site) => {
        const existingSite = acc.find((s) => s.id === site.id);
        if (existingSite) {
          if (site.idSystem && site.systemName) {
            existingSite.systems.push({
              id: site.idSystem,
              name: site.systemName,
            });
          }
        } else {
          acc.push({
            ...site,
            systems:
              site.idSystem && site.systemName
                ? [{ id: site.idSystem, name: site.systemName }]
                : [],
            idCompany: site.idCompany,
            companyName: site.companyName,
            contactName: site.contactName,
            contactMail: site.contactMail,
            contactPhone: site.contactPhone,
          });
        }
        return acc;
      }, []);
      setSites(groupedSites);
    } catch (error) {
      console.error("Error fetching sites:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al obtener los sitios. Por favor, intente nuevamente.");
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
      // Handle error
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axiosInstance.get("/clients");
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      // Handle error
    }
  };

  const fetchSupervisors = async () => {
    try {
      const response = await axiosInstance.get("/users");
      const supervisorUsers = response.data.filter((user) => user.roleId === 3);
      setSupervisors(supervisorUsers);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al obtener los supervisores. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

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

  const handleSiteClick = (site) => {
    setSelectedSite(site);
    setOpenSiteDialog(true);
  };

  const handleCloseSiteForm = () => {
    setSelectedCompany(null); // Clear the selected company
    setOpenSiteForm(false);
    setSiteForm({
      idCompany: "",
      idClient: "",
      name: "",
      supervisor: "",
      contactName: "",
      contactMail: "",
      contactPhone: "",
      address: "",
    }); // Reset the form fields
    setSelectedSystems([]);
  };

  const handleEditSite = (site) => {
    setSelectedSite(site);
    setSiteForm({
      idClient: site.idClient,
      name: site.name,
      supervisor: site.SupervisorId,
      contactName: site.contactName,
      contactMail: site.contactMail,
      contactPhone: site.contactPhone,
    });
    setSelectedCompany(companies.find((company) => company.id === site.idCompany));
    setSelectedSystems(site.systems || []);
    setOpenSiteForm(true);
  };

  const handleDeleteSite = (site) => {
    setSelectedSite(site);
    setOpenConfirmDelete(true);
  };

  const confirmDeleteSite = async () => {
    try {
      const response = await axiosInstance.delete(`/sites/${selectedSite.id}`);
      fetchSites();
      setOpenConfirmDelete(false);
      setOpenSiteDialog(false);
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error deleting site:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al eliminar el sitio. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const handleSiteFormSubmit = async () => {
    try {
      let response;
      if (selectedSite) {
        response = await axiosInstance.put(`/sites/${selectedSite.id}`, {
          name: siteForm.name,
          idClient: siteForm.idClient,
          supervisor: siteForm.supervisor,
          contactName: siteForm.contactName,
          contactMail: siteForm.contactMail,
          contactPhone: siteForm.contactPhone,
          address: siteForm.address,
        });

        // Assign selected systems to the site
        for (const system of selectedSystems) {
          await assignSystemToSite(system.id);
        }

        // Disassociate unselected systems from the site
        const existingSystems = selectedSite.systems || [];
        for (const existingSystem of existingSystems) {
          if (
            !selectedSystems.some((system) => system.id === existingSystem.id)
          ) {
            await disassociateSystemFromSite(existingSystem.id);
          }
        }
      } else {
        response = await axiosInstance.post("/sites", {
          ...siteForm,
          idCompany: selectedCompany?.id,
          contactName: siteForm.contactName,
          contactMail: siteForm.contactMail,
          contactPhone: siteForm.contactPhone,
          address: siteForm.address,
        });
      }
      setOpenSiteForm(false);
      setSiteForm({
        idCompany: "",
        idClient: "",
        name: "",
        supervisor: "",
        contactName: "",
        contactMail: "",
        contactPhone: "",
        address: "",

      });
      setSelectedSystems([]);
      setSelectedCompany(null);
      fetchSites();
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error submitting site form:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al crear o actualizar un sitio. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const assignSystemToSite = async (idSystem) => {
    try {
      await axiosInstance.post(`/sites/${selectedSite.id}/systems/assign`, {
        idSystem,
      });
    } catch (error) {
      console.error("Error assigning system to site:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al asociar un sistema a un sitio. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const disassociateSystemFromSite = async (idSystem) => {
    try {
      await axiosInstance.put(`/sites/${selectedSite.id}/systems/dissociate`, {
        idSystem,
      });
    } catch (error) {
      console.error("Error disassociating system from site:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al desasociar un sistema a un sitio. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const isFormValid = () => {
    return (
      siteForm.name.trim() !== "" &&
      siteForm.idClient !== "" &&
      siteForm.supervisor !== ""
    );
  };

  const filterSites = () => {
    return sites
      .filter((site) => {
        const { name, clientName, SupervisorName, systems, companyName, contactName, contactMail, contactPhone } = site;
        const lowerCaseQuery = searchQuery.toLowerCase();
        return (
          (name && name.toLowerCase().includes(lowerCaseQuery)) ||
          (clientName && clientName.toLowerCase().includes(lowerCaseQuery)) ||
          (SupervisorName && SupervisorName.toLowerCase().includes(lowerCaseQuery)) ||
          (Array.isArray(systems) && systems.some(system => system.name && system.name.toLowerCase().includes(lowerCaseQuery))) ||
          (companyName && companyName.toLowerCase().includes(lowerCaseQuery)) ||
          (contactName && contactName.toLowerCase().includes(lowerCaseQuery)) ||
          (contactMail && contactMail.toLowerCase().includes(lowerCaseQuery)) ||
          (contactPhone && contactPhone.toLowerCase().includes(lowerCaseQuery))
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  return (
    <SitesContainer>
      <Header />
      <Main>
        <Typography variant="h4" component="h1" gutterBottom>
          Sitios
        </Typography>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          {canEditRequest && (
            <>
              <Button
                variant="contained"
                onClick={() => {
                  setSelectedSite(null);
                  setSiteForm({
                    idClient: "",
                    name: "",
                    supervisor: "",
                  });
                  setSelectedSystems([]);
                  setOpenSiteForm(true);
                }}
              >
                Crear nuevo sitio
              </Button>
            </>
          )}
          <TextField
            label="Buscar"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <Grid container spacing={2}>
          {filterSites().map((site) => (
            <Grid item xs={12} sm={6} md={4} key={site.id}>
              <SiteCard>
                <CardContent>
                  <Typography variant="h6">{site.name}</Typography>
                  <Typography color="textSecondary">
                    Empresa: {site.companyName}
                  </Typography>
                  <Typography color="textSecondary">
                    Edificio: {site.clientName}
                  </Typography>
                  <Typography color="textSecondary">
                    Supervisor: {site.SupervisorName}
                  </Typography>
                  <Typography color="textSecondary">
                    Sistemas:{" "}
                    {site.systems.map((system) => system.name).join(", ")}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleSiteClick(site)}>
                    Ver detalles
                  </Button>
                  {canEditRequest && (
                    <>
                      <Button size="small" onClick={() => handleEditSite(site)}>
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteSite(site)}
                      >
                        Eliminar
                      </Button>
                    </>
                  )}
                </CardActions>
              </SiteCard>
            </Grid>
          ))}
        </Grid>
      </Main>

      {/* Site Details Dialog */}
      <Dialog open={openSiteDialog} onClose={() => setOpenSiteDialog(false)}>
        <DialogTitle>Detalles del sitio</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>Nombre:</strong> {selectedSite?.name}
          </Typography>
          <Typography>
            <strong>Empresa:</strong> {selectedSite?.companyName}
          </Typography>
          <Typography>
            <strong>Edificio:</strong> {selectedSite?.clientName}
          </Typography>
          <Typography>
            <strong>Supervisor:</strong> {selectedSite?.SupervisorName}
          </Typography>
          <Typography>
            <strong>Dirección:</strong> {selectedSite?.address}
          </Typography>
          <Typography>
            <strong>Nombre de contacto:</strong> {selectedSite?.contactName}
          </Typography>
          <Typography>
            <strong>Correo electrónico de contacto:</strong> {selectedSite?.contactMail}
          </Typography>
          <Typography>
            <strong>Teléfono de contacto:</strong> {selectedSite?.contactPhone}
          </Typography>
          <Typography>
            <strong>Sistemas:</strong>{" "}
            {selectedSite?.systems.map((system) => system.name).join(", ")}
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Site Form Dialog */}
      <Dialog open={openSiteForm} onClose={handleCloseSiteForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedSite ? "Editar sitio" : "Crear nuevo sitio"}
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            fullWidth
            options={companies}
            getOptionLabel={(company) => company.name}
            renderInput={(params) => (
              <TextField {...params} label="Empresa" margin="normal" required />
            )}
            value={selectedCompany}
            onChange={(event, newValue) => {
              setSelectedCompany(newValue);
              setSiteForm((prevForm) => ({
                ...prevForm,
                idCompany: "",
                idClient: "", // Reset the selected client when changing the company
              }));
            }}
          />

          {selectedCompany && (
            <Autocomplete
              fullWidth
              options={clients.filter((client) => client.companyId === selectedCompany?.id)}
              getOptionLabel={(client) => client.name}
              renderInput={(params) => (
                <TextField {...params} label="Edificio" margin="normal" required />
              )}
              value={
                clients.find((client) => client.id === siteForm.idClient) || null
              }
              onChange={(event, newValue) => {
                setSiteForm((prevForm) => ({
                  ...prevForm,
                  idClient: newValue ? newValue.id : "",
                }));
              }}
            />
          )}
          <TextField
            fullWidth
            margin="normal"
            label="Nombre"
            name="name"
            value={siteForm.name}
            onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })}
            required
          />
          <Autocomplete
            fullWidth
            options={supervisors}
            getOptionLabel={(supervisor) =>
              `${supervisor.name} ${supervisor.lastname}`
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Supervisor"
                margin="normal"
                required
              />
            )}
            value={
              supervisors.find(
                (supervisor) => supervisor.id === siteForm.supervisor
              ) || null
            }
            onChange={(event, newValue) => {
              setSiteForm((prevForm) => ({
                ...prevForm,
                supervisor: newValue ? newValue.id : "",
              }));
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Dirección"
            name="address"
            value={siteForm.address}
            onChange={(e) => setSiteForm({ ...siteForm, address: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Nombre de contacto"
            name="contactName"
            value={siteForm.contactName}
            onChange={(e) => setSiteForm({ ...siteForm, contactName: e.target.value })}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Correo electrónico de contacto"
            name="contactMail"
            value={siteForm.contactMail}
            onChange={(e) => setSiteForm({ ...siteForm, contactMail: e.target.value })}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Teléfono de contacto"
            name="contactPhone"
            value={siteForm.contactPhone}
            onChange={(e) => setSiteForm({ ...siteForm, contactPhone: e.target.value })}
          />
          {selectedSite && ( // Add this condition
            <Autocomplete
              multiple
              fullWidth
              options={systems}
              getOptionLabel={(system) => system.name}
              renderInput={(params) => (
                <TextField {...params} label="Sistemas" margin="normal" />
              )}
              value={selectedSystems}
              onChange={(event, newValue) => setSelectedSystems(newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option.id}
                    label={option.name}
                    {...getTagProps({ index })}
                  />
                ))
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSiteForm(false)}>Cancelar</Button>
          <Button
            onClick={handleSiteFormSubmit}
            color="primary"
            disabled={!isFormValid()}
          >
            {selectedSite ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={openConfirmDelete} onClose={() => setOpenConfirmDelete(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro que deseas eliminar este sitio?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDelete(false)}>Cancelar</Button>
          <Button onClick={confirmDeleteSite} color="error">
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
    </SitesContainer>
  );
}

export default SitesPage;