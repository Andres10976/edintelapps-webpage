// RequestPage.js
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
  Autocomplete,
} from "@mui/material";
import { styled } from "@mui/system";
import Header from "./Header";
import axiosInstance from "../axiosInstance";

const RequestPageContainer = styled(Box)(({ theme }) => ({
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

const RequestCard = styled(Card)(({ theme }) => ({
  cursor: "pointer",
  transition: "background-color 0.3s",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

function RequestPage() {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({
    idSite: "",
    code: "",
    type: "",
    scope: "",
    idSystem: "",
  });
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [selectedRequestType, setSelectedRequestType] = useState(null);
  const [requestTypes, setRequestTypes] = useState([]);

  useEffect(() => {
    fetchRequests();
    fetchSites();
    fetchRequestTypes();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axiosInstance.get("/requests");
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const fetchSites = async () => {
    try {
      const response = await axiosInstance.get("/sites");
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

  const fetchRequestTypes = async () => {
    try {
      const response = await axiosInstance.get("/requests/types");
      setRequestTypes(response.data);
    } catch (error) {
      console.error("Error fetching request types:", error);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredRequests = requests.filter((request) => {
    const { code, siteName, systemName, clientName } = request;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      code.toLowerCase().includes(lowerCaseSearchTerm) ||
      siteName.toLowerCase().includes(lowerCaseSearchTerm) ||
      systemName.toLowerCase().includes(lowerCaseSearchTerm) ||
      clientName.toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setSelectedClient(clients.find((client) => client.id === request.idClient));
    setSelectedSite(
      clients
        .find((client) => client.id === request.idClient)
        ?.sites.find((site) => site.id === request.idSite)
    );
    setSelectedSystem(
      clients
        .find((client) => client.id === request.idClient)
        ?.sites.find((site) => site.id === request.idSite)
        ?.systems.find((system) => system.id === request.idSystem)
    );
    setSelectedRequestType(
      requestTypes.find((type) => type.id === request.idType)
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedRequest(null);
    setOpenDialog(false);
  };

  const handleCreateRequest = () => {
    setOpenCreateDialog(true);
    setSelectedClient(null);
    setSelectedSite(null);
    setSelectedSystem(null);
    setSelectedRequestType(null);
    setNewRequest({
      idSite: "",
      code: "",
      type: "",
      scope: "",
      idSystem: "",
    });
  };

  const handleDeleteConfirmation = () => {
    setOpenConfirmationDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setNewRequest({
      idSite: "",
      code: "",
      type: "",
      scope: "",
      idSystem: "",
    });
    setSelectedClient(null);
    setSelectedSite(null);
    setSelectedSystem(null);
    setSelectedRequestType(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewRequest((prevRequest) => ({
      ...prevRequest,
      [name]: value,
    }));
  };

  const handleSelectedRequestChange = (event) => {
    const { name, value } = event.target;
    setSelectedRequest((prevRequest) => ({
      ...prevRequest,
      [name]: value,
    }));
  };

  const handleDeleteRequest = async () => {
    try {
      await axiosInstance.delete(`/requests/${selectedRequest.id}`);
      fetchRequests();
      handleCloseDialog();
      setOpenConfirmationDialog(false);
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const isCreateButtonDisabled = () => {
    const { idSite, code, type, scope, idSystem } = newRequest;
    return (
      !idSite ||
      code.trim().length < 2 ||
      !type ||
      scope.trim().length < 2 ||
      !idSystem
    );
  };

  const handleCreateSubmit = async () => {
    try {
      await axiosInstance.post("/requests", {
        ...newRequest,
        idSite: selectedSite?.id,
        type: selectedRequestType?.id,
        idSystem: selectedSystem?.id,
      });
      fetchRequests();
      handleCloseCreateDialog();
    } catch (error) {
      console.error("Error creating request:", error);
    }
  };

  const handleUpdateRequest = async () => {
    try {
      await axiosInstance.put(`/requests/${selectedRequest.id}`, {
        ...selectedRequest,
        idSite: selectedSite?.id,
        type: selectedRequestType?.id,
        idSystem: selectedSystem?.id,
      });
      fetchRequests();
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  const handleClientChange = (event, value) => {
    setSelectedClient(value);
    setSelectedSite(null);
    setSelectedSystem(null);
    setNewRequest((prevRequest) => ({
      ...prevRequest,
      idSite: "",
      idSystem: "",
    }));
  };

  const handleSiteChange = (event, value) => {
    setSelectedSite(value);
    setSelectedSystem(null);
    setNewRequest((prevRequest) => ({
      ...prevRequest,
      idSite: value ? value.id : "",
      idSystem: "",
    }));
  };

  const handleSystemChange = (event, value) => {
    setSelectedSystem(value);
    setNewRequest((prevRequest) => ({
      ...prevRequest,
      idSystem: value ? value.id : "",
    }));
  };

  const handleRequestTypeChange = (event, value) => {
    setSelectedRequestType(value);
    setNewRequest((prevRequest) => ({
      ...prevRequest,
      type: value ? value.id : "",
    }));
  };

  return (
    <RequestPageContainer>
      <Header />
      <Main>
        <Typography variant="h4" component="h1" gutterBottom>
          Solicitudes
        </Typography>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <SearchBox
            label="Buscar solicitudes"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateRequest}
          >
            Crear solicitud
          </Button>
        </Box>
        <Grid container spacing={2}>
          {filteredRequests.map((request) => (
            <Grid item xs={12} sm={6} md={4} key={request.id}>
              <RequestCard onClick={() => handleRequestClick(request)}>
                <CardContent>
                  <Typography variant="h6">{request.code}</Typography>
                  <Typography color="textSecondary">
                    {request.clientName}
                  </Typography>
                  <Typography color="textSecondary">
                    {request.siteName}
                  </Typography>
                  <Typography color="textSecondary">
                    {request.systemName}
                  </Typography>
                  <Typography color="textSecondary">
                    {request.requestTypeName}
                  </Typography>
                </CardContent>
              </RequestCard>
            </Grid>
          ))}
        </Grid>
      </Main>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        {selectedRequest && (
          <>
            <DialogTitle>{selectedRequest.code}</DialogTitle>
            <DialogContent>
              <Autocomplete
                options={clients}
                getOptionLabel={(client) => client?.name || ""}
                value={selectedClient}
                onChange={(event, value) => setSelectedClient(value)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} label="Cliente" margin="normal" />
                )}
              />
              {selectedClient && (
                <Autocomplete
                  options={selectedClient.sites}
                  getOptionLabel={(site) => site?.name || ""}
                  value={selectedSite}
                  onChange={(event, value) => setSelectedSite(value)}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Sitio" margin="normal" />
                  )}
                />
              )}
              {selectedSite && (
                <Autocomplete
                  options={selectedSite.systems}
                  getOptionLabel={(system) => system?.name || ""}
                  value={selectedSystem}
                  onChange={(event, value) => setSelectedSystem(value)}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Sistema" margin="normal" />
                  )}
                />
              )}
              <TextField
                fullWidth
                margin="normal"
                label="Código"
                name="code"
                value={selectedRequest.code}
                onChange={handleSelectedRequestChange}
                required
              />
              <TextField
                fullWidth
                margin="normal"
                label="Alcance"
                name="scope"
                value={selectedRequest.scope}
                onChange={handleSelectedRequestChange}
                required
              />
              <Autocomplete
                options={requestTypes}
                getOptionLabel={(type) => type?.name || ""}
                value={selectedRequestType}
                onChange={(event, value) => setSelectedRequestType(value)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tipo de solicitud"
                    margin="normal"
                  />
                )}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancelar</Button>
              <Button onClick={handleDeleteConfirmation} color="secondary">
                Eliminar
              </Button>
              <Button onClick={handleUpdateRequest} color="primary">
                Actualizar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog}>
        <DialogTitle>Crear solicitud</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={clients}
            getOptionLabel={(client) => client?.name || ""}
            value={selectedClient}
            onChange={handleClientChange}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField {...params} label="Cliente" margin="normal" />
            )}
          />
          {selectedClient && (
            <Autocomplete
              options={selectedClient.sites}
              getOptionLabel={(site) => site?.name || ""}
              value={selectedSite}
              onChange={handleSiteChange}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField {...params} label="Sitio" margin="normal" />
              )}
            />
          )}
          {selectedSite && (
            <Autocomplete
              options={selectedSite.systems}
              getOptionLabel={(system) => system?.name || ""}
              value={selectedSystem}
              onChange={handleSystemChange}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField {...params} label="Sistema" margin="normal" />
              )}
            />
          )}
          <TextField
            fullWidth
            margin="normal"
            label="Código"
            name="code"
            value={newRequest.code}
            onChange={handleInputChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Alcance"
            name="scope"
            value={newRequest.scope}
            onChange={handleInputChange}
            required
          />
          <Autocomplete
            options={requestTypes}
            getOptionLabel={(type) => type?.name || ""}
            value={selectedRequestType}
            onChange={handleRequestTypeChange}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tipo de solicitud"
                margin="normal"
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancelar</Button>
          <Button
            onClick={handleCreateSubmit}
            color="primary"
            disabled={isCreateButtonDisabled()}
          >
            Crear solicitud
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openConfirmationDialog}
        onClose={() => setOpenConfirmationDialog(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro que deseas eliminar la solicitud "
            {selectedRequest?.code}
            "?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmationDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteRequest} color="secondary">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </RequestPageContainer>
  );
}

export default RequestPage;
