// SitesPage.js
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
  Chip,
  Autocomplete,
} from "@mui/material";
import { styled } from "@mui/system";
import Header from "./Header";
import axiosInstance from "../axiosInstance";

const SitesPageContainer = styled(Box)(({ theme }) => ({
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

const SiteCard = styled(Card)(({ theme }) => ({
  cursor: "pointer",
  transition: "background-color 0.3s",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

function SitesPage() {
  const [sites, setSites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSite, setSelectedSite] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [newSite, setNewSite] = useState({
    idClient: "",
    name: "",
    supervisor: "",
  });
  const [supervisors, setSupervisors] = useState([]);
  const [clients, setClients] = useState([]);
  const [systems, setSystems] = useState([]);
  const [selectedSystems, setSelectedSystems] = useState([]);

  useEffect(() => {
    fetchSites();
    fetchSupervisors();
    fetchClients();
    fetchSystems();
  }, []);

  const fetchSites = async () => {
    try {
      const response = await axiosInstance.get("/sites");
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
          });
        }
        return acc;
      }, []);
      setSites(groupedSites);
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const response = await axiosInstance.get("/users");
      const supervisorUsers = response.data.filter((user) => user.roleId === 3);
      setSupervisors(supervisorUsers);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axiosInstance.get("/clients");
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDeleteConfirmation = () => {
    setOpenConfirmationDialog(true);
  };

  const filteredSites = sites.filter((site) => {
    const { name, clientName, SupervisorName } = site;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(lowerCaseSearchTerm) ||
      (clientName && clientName.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (SupervisorName &&
        SupervisorName.toLowerCase().includes(lowerCaseSearchTerm))
    );
  });

  const handleSiteClick = (site) => {
    const supervisor = supervisors.find(
      (supervisor) => supervisor.id === site.SupervisorId
    );

    const client = clients.find((client) => client.id === site.idClient);
    setSelectedSite({ ...site, supervisor, client });
    setSelectedSystems(site.systems || []);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedSite(null);
    setOpenDialog(false);
  };

  const handleCreateSite = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setNewSite({
      idClient: "",
      name: "",
      supervisor: "",
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewSite((prevSite) => ({
      ...prevSite,
      [name]: value,
    }));
  };

  const handleSelectedSiteChange = (event) => {
    const { name, value } = event.target;
    setSelectedSite((prevSite) => ({
      ...prevSite,
      [name]: value,
    }));
  };

  const handleDeleteSite = async () => {
    try {
      await axiosInstance.delete(`/sites/${selectedSite.id}`);
      fetchSites();
      handleCloseDialog();
      setOpenConfirmationDialog(false);
    } catch (error) {
      console.error("Error deleting site:", error);
    }
  };

  const isCreateButtonDisabled = () => {
    const { idClient, name, supervisor } = newSite;
    return !idClient || name.trim().length < 2 || !supervisor;
  };

  const isUpdateButtonDisabled = () => {
    const { name, supervisor, client } = selectedSite;
    return name.trim().length < 2 || !supervisor || !client;
  };

  const handleCreateSubmit = async () => {
    try {
      await axiosInstance.post("/sites", newSite);
      fetchSites();
      handleCloseCreateDialog();
    } catch (error) {
      console.error("Error creating site:", error);
    }
  };

  const fetchSystems = async () => {
    try {
      const response = await axiosInstance.get("/systems");
      setSystems(response.data);
    } catch (error) {
      console.error("Error fetching systems:", error);
    }
  };

  const handleSystemChange = (event, values) => {
    setSelectedSystems(values);
  };

  const assignSystemToSite = async (idSystem) => {
    try {
      await axiosInstance.post(`/sites/${selectedSite.id}/systems/assign`, {
        idSystem,
      });
    } catch (error) {
      console.error("Error assigning system to site:", error);
    }
  };

  const disassociateSystemFromSite = async (idSystem) => {
    try {
      await axiosInstance.put(
        `/sites/${selectedSite.id}/systems/disassociate`,
        {
          idSystem,
        }
      );
    } catch (error) {
      console.error("Error disassociating system from site:", error);
    }
  };

  const handleUpdateSite = async () => {
    try {
      await axiosInstance.put(`/sites/${selectedSite.id}`, {
        name: selectedSite.name,
        idClient: selectedSite.client.id,
        supervisor: selectedSite.supervisor.id,
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

      fetchSites();
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating site:", error);
    }
  };

  return (
    <SitesPageContainer>
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
          <SearchBox
            label="Buscar sitios"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateSite}
          >
            Crear sitio
          </Button>
        </Box>
        <Grid container spacing={2}>
          {filteredSites.map((site) => (
            <Grid item xs={12} sm={6} md={4} key={site.id}>
              <SiteCard onClick={() => handleSiteClick(site)}>
                <CardContent>
                  <Typography variant="h6">{site.name}</Typography>
                  <Typography color="textSecondary">
                    Cliente: {site.clientName}
                  </Typography>
                  <Typography color="textSecondary">
                    Supervisor: {site.SupervisorName}
                  </Typography>
                  <Typography color="textSecondary">
                    Sistemas:{" "}
                    {site.systems.map((system) => system.name).join(", ")}
                  </Typography>
                </CardContent>
              </SiteCard>
            </Grid>
          ))}
        </Grid>
      </Main>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        {selectedSite && (
          <>
            <DialogTitle>{selectedSite.name}</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                margin="normal"
                label="Nombre"
                name="name"
                value={selectedSite.name}
                onChange={handleSelectedSiteChange}
                required
              />
              <Autocomplete
                fullWidth
                options={clients}
                getOptionLabel={(client) => client.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cliente"
                    margin="normal"
                    required
                  />
                )}
                value={selectedSite.client || null}
                onChange={(event, newValue) => {
                  setSelectedSite((prevSite) => ({
                    ...prevSite,
                    client: newValue,
                    idClient: newValue ? newValue.id : "",
                  }));
                }}
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
                value={selectedSite.supervisor || null}
                onChange={(event, newValue) => {
                  setSelectedSite((prevSite) => ({
                    ...prevSite,
                    supervisor: newValue,
                    SupervisorId: newValue ? newValue.id : "",
                  }));
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
              <Autocomplete
                multiple
                fullWidth
                options={systems}
                getOptionLabel={(system) => system.name}
                renderInput={(params) => (
                  <TextField {...params} label="Sistemas" margin="normal" />
                )}
                value={selectedSystems}
                onChange={handleSystemChange}
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
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancelar</Button>
              <Button onClick={handleDeleteConfirmation} color="secondary">
                Eliminar
              </Button>
              <Button
                onClick={handleUpdateSite}
                color="primary"
                disabled={isUpdateButtonDisabled()}
              >
                Actualizar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog}>
        <DialogTitle>Crear sitio</DialogTitle>
        <DialogContent>
          <Autocomplete
            fullWidth
            options={clients}
            getOptionLabel={(client) => client.name}
            renderInput={(params) => (
              <TextField {...params} label="Cliente" margin="normal" required />
            )}
            value={
              clients.find((client) => client.id === newSite.idClient) || null
            }
            onChange={(event, newValue) => {
              setNewSite((prevSite) => ({
                ...prevSite,
                idClient: newValue ? newValue.id : "",
              }));
            }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Nombre"
            name="name"
            value={newSite.name}
            onChange={handleInputChange}
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
                (supervisor) => supervisor.id === newSite.supervisor
              ) || null
            }
            onChange={(event, newValue) => {
              setNewSite((prevSite) => ({
                ...prevSite,
                supervisor: newValue ? newValue.id : "",
              }));
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancelar</Button>
          <Button
            onClick={handleCreateSubmit}
            color="primary"
            disabled={isCreateButtonDisabled()}
          >
            Crear sitio
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openConfirmationDialog}
        onClose={() => setOpenConfirmationDialog(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro que deseas eliminar este sitio?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmationDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteSite} color="secondary">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </SitesPageContainer>
  );
}

export default SitesPage;
