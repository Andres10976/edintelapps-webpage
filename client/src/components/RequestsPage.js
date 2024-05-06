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
  Autocomplete,
  TextareaAutosize,
} from "@mui/material";
import Header from "./Header";
import axiosInstance from "../axiosInstance";
import { jwtDecode } from "jwt-decode";
import { CustomCard, CustomMain, CustomContainer } from "./styledComponents";
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const ITEM_HEIGHT = 48;

function RequestPage() {
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [openRequestForm, setOpenRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
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
  const [roleId, setRoleId] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [openAssignTechnicianDialog, setOpenAssignTechnicianDialog] = useState(false);
  const [openAcknowledgeConfirmation, setOpenAcknowledgeConfirmation] = useState(false);
  const [openStartConfirmation, setOpenStartConfirmation] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageDialogContent, setMessageDialogContent] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogContent, setErrorDialogContent] = useState("");
  const [openAssignDateTimeDialog, setOpenAssignDateTimeDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState({
    date: '',
    time: '',
  });
  const [openFinishRequestDialog, setOpenFinishRequestDialog] = useState(false);
  const [openConfirmFinish, setOpenConfirmFinish] = useState(false);
  const [ticketFile, setTicketFile] = useState(null);
  const [reportFile, setReportFile] = useState(null);
  const [openCloseConfirmation, setOpenCloseConfirmation] = useState(false);

  useEffect(() => {
    getRoleFromToken();
    fetchSites();
    fetchRequests();
  }, []);

  useEffect(() => {
    if (roleId !== 5 && roleId !== null) {
      fetchTechnicians();
      fetchRequestTypes();
    }
  }, [roleId]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      let response;
      if (token) {
        const decodedToken = jwtDecode(token);
        if (decodedToken.roleId === 5 && decodedToken.siteId) {
          response = await axiosInstance.get(`/sites/${decodedToken.siteId}/requests`);
        } else if (decodedToken.roleId === 5) {
          response = await axiosInstance.get(`/clients/${decodedToken.clientId}/requests`);
        } else if (decodedToken.roleId === 4) {
          response = await axiosInstance.get(`/technicians/${decodedToken.userId}/requests`);
        } else {
          response = await axiosInstance.get("/requests");
        }
      }
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al obtener las solicitudes. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const fetchSites = async () => {
    try {
      const token = localStorage.getItem("token");
      let response;
      if (token) {
        const decodedToken = jwtDecode(token);
        if (decodedToken.roleId === 5 && decodedToken.siteId) {
          response = await axiosInstance.get(`/clients/${decodedToken.clientId}/sites/${decodedToken.siteId}`);
        } else if (decodedToken.roleId === 5) {
          response = await axiosInstance.get(`/clients/${decodedToken.clientId}/sites`);
        } else {
          response = await axiosInstance.get("/sites");
        }
      }
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

  const fetchTechnicians = async () => {
    try {
      const response = await axiosInstance.get("/users");
      const technicianUsers = response.data.filter((user) => user.roleId === 3 || user.roleId === 4);
      setTechnicians(technicianUsers);
    } catch (error) {
      console.error("Error fetching technicians:", error);
    }
  };

  const getRoleFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setRoleId(decodedToken.roleId);
    }
  };

  const canEditRequest = [1, 2, 3].includes(roleId);
  const isSupervisor = [3].includes(roleId);

  const fetchRequestTypes = async () => {
    try {
      const response = await axiosInstance.get("/requests/types");
      setRequestTypes(response.data);
    } catch (error) {
      console.error("Error fetching request types:", error);
    }
  };

  const filterRequests = () => {
    const filteredRequests = requests.filter((request) => {
      const { code, siteName, systemName, clientName, statusName, requestTypeName } = request;
      const lowerCaseQuery = searchQuery.toLowerCase();
      return (
        (code && code.toLowerCase().includes(lowerCaseQuery)) ||
        (siteName && siteName.toLowerCase().includes(lowerCaseQuery)) ||
        (systemName && systemName.toLowerCase().includes(lowerCaseQuery)) ||
        (clientName && clientName.toLowerCase().includes(lowerCaseQuery)) ||
        (statusName && statusName.toLowerCase().includes(lowerCaseQuery)) ||
        (requestTypeName && requestTypeName.toLowerCase().includes(lowerCaseQuery))
      );
    });

    const statusOrder = [1, 5, 4, 2, 3, 6];
    filteredRequests.sort((a, b) => {
      const statusA = statusOrder.indexOf(a.idStatus);
      const statusB = statusOrder.indexOf(b.idStatus);
      if (statusA !== statusB) {
        return statusA - statusB;
      }
      const codeA = a.code ? a.code.replace(/\s/g, '') : '';
      const codeB = b.code ? b.code.replace(/\s/g, '') : '';
      return codeA.localeCompare(codeB);
    });

    return filteredRequests;
  };

  const handleFinishRequest = (request) => {
    setSelectedRequest(request);
    setOpenFinishRequestDialog(true);
    handleMenuClose();
  };

  const handleCloseRequest = (request) => {
    setSelectedRequest(request);
    setOpenCloseConfirmation(true);
    handleMenuClose();
  };

  const confirmFinishRequest = async () => {
    try {
      const formData = new FormData();
      if (ticketFile) {
        formData.append("ticket", ticketFile);
      }
      if (reportFile) {
        formData.append("report", reportFile);
      }

      const response = await axiosInstance.post(`/requests/${selectedRequest.id}/ticketAndReport`, formData);
      fetchRequests();
      setOpenFinishRequestDialog(false);
      setOpenConfirmFinish(false);
      setTicketFile(null);
      setReportFile(null);
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error finishing request:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al finalizar la solicitud. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const downloadFile = async (url, fileName) => {
    try {
      const response = await axiosInstance.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    } catch (error) {
      console.error(`Error downloading ${fileName}:`, error);
      if (error.response) {
        if (error.response.status === 404) {
          setErrorDialogContent(`${fileName} no encontrado.`);
        } else {
          setErrorDialogContent(error.response.data.message || `Error al descargar ${fileName}. Por favor, intente nuevamente.`);
        }
        setErrorDialogOpen(true);
      }
    }
  };
  const confirmCloseRequest = async () => {
    try {
      const response = await axiosInstance.post(`/requests/${selectedRequest.id}/close`);
      fetchRequests();
      setOpenCloseConfirmation(false);
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error closing request:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al cerrar la solicitud. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };


  const handleMenuOpen = (event, request) => {
    setSelectedRequest(request);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setOpenRequestDialog(true);
  };

  const handleAssignDateTime = (request) => {
    setSelectedRequest(request);
    setSelectedDateTime({
      date: '',
      time: '',
    });
    setOpenAssignDateTimeDialog(true);
  };

  const handleAssignTechnician = (request) => {
    setSelectedRequest(request);
    setOpenAssignTechnicianDialog(true);
  };

  const handleTechnicianChange = (event, value) => {
    setSelectedTechnician(value);
  };

  function formatDateTime(dateString) {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric', // Optionally include seconds 
      timeZone: 'America/Costa_Rica'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  }

  function formatTime(datetimeString) {
    const date = new Date(datetimeString);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  }

  function formatDate(dateString) {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: 'UTC'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  }

  const handleAssignTechnicianSubmit = async () => {
    try {
      const response = await axiosInstance.post(`/requests/${selectedRequest.id}/assign`, {
        idTechnician: selectedTechnician?.id,
      });
      fetchRequests();
      setOpenAssignTechnicianDialog(false);
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error assigning technician:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al asignar técnico. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const handleEditRequest = (request) => {
    setSelectedRequest(request);
    setRequestForm({
      idSite: request.idSite,
      code: request.code,
      type: request.idType,
      scope: request.scope,
      idSystem: request.idSystem,
    });
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
    setOpenRequestForm(true);
  };

  const handleDeleteRequest = (request) => {
    setSelectedRequest(request);
    setOpenConfirmDelete(true);
  };

  const confirmDeleteRequest = async () => {
    try {
      const response = await axiosInstance.delete(`/requests/${selectedRequest.id}`);
      fetchRequests();
      setOpenConfirmDelete(false);
      setOpenRequestDialog(false);
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error deleting request:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al eliminar la solicitud. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const isRequestFormButtonDisabled = () => {
    const { idSite, code, type, scope, idSystem } = requestForm;
    let ifClientRequest = false
    if (roleId !== 5) {
      ifClientRequest = (code?.trim()?.length ?? 0) < 2 || !type;
    }
    return (
      !idSite ||
      scope.trim().length < 2 ||
      !idSystem ||
      ifClientRequest
    );
  };

  const handleAcknowledgeRequest = async () => {
    try {
      const response = await axiosInstance.post(`/technicians/${selectedRequest.idTechnicianAssigned}/requests/${selectedRequest.id}/acknowledge`);
      fetchRequests();
      setOpenAcknowledgeConfirmation(false);
      setOpenRequestDialog(false);
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error acknowledging request:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al reconocer la solicitud. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const handleStartRequest = async () => {
    try {
      const response = await axiosInstance.post(`/technicians/${selectedRequest.idTechnicianAssigned}/requests/${selectedRequest.id}/start`);
      fetchRequests();
      setOpenStartConfirmation(false);
      setOpenRequestDialog(false);
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error starting request:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al iniciar la solicitud. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const handleAssignDateTimeSubmit = async () => {
    try {
      let time;
      let date;
      if (!selectedDateTime.time) {
        time = null;
      } else {
        time = `${selectedDateTime.time}:00.0000000`
      }
      if (!selectedDateTime.date) {
        date = null;
      } else {
        date = selectedDateTime.date
      }
      const response = await axiosInstance.post(`/requests/${selectedRequest.id}/assignDateTime`, {
        date: date,
        time: time,
      });
      fetchRequests();
      setOpenAssignDateTimeDialog(false);
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error assigning date and time:", error);
      if (error.response) {
        setErrorDialogContent(
          error.response.data.message || "Error al asignar fecha y hora. Por favor, intente nuevamente."
        );
        setErrorDialogOpen(true);
      }
    }
  };

  const handleRequestFormSubmit = async () => {
    try {
      let response;
      if (selectedRequest) {
        response = await axiosInstance.put(`/requests/${selectedRequest.id}`, {
          ...requestForm,
          idSite: selectedSite?.id,
          type: selectedRequestType?.id,
          idSystem: selectedSystem?.id,
        });
      } else {
        let type;
        if (roleId === 5) {
          type = 1;
        } else {
          type = selectedRequestType?.id
        }
        response = await axiosInstance.post("/requests", {
          ...requestForm,
          idSite: selectedSite?.id,
          type: type,
          idSystem: selectedSystem?.id,
        });
      }
      fetchRequests();
      setOpenRequestForm(false);
      setRequestForm({
        idSite: "",
        code: "",
        type: "",
        scope: "",
        idSystem: "",
      });
      setMessageDialogContent(response.data.message);
      setMessageDialogOpen(true);
    } catch (error) {
      console.error("Error submitting request form:", error);
      if (error.response) {
        setErrorDialogContent(error.response.data.message || "Error al enviar la solicitud. Por favor, intente nuevamente.");
        setErrorDialogOpen(true);
      }
    }
  };

  const handleClientChange = (event, value) => {
    setSelectedClient(value);
    setSelectedSite(null);
    setSelectedSystem(null);
    setRequestForm((prevForm) => ({
      ...prevForm,
      idSite: "",
      idSystem: "",
    }));

    if (value && value.sites.length === 1) {
      setSelectedSite(value.sites[0]);
      setRequestForm((prevForm) => ({
        ...prevForm,
        idSite: value.sites[0].id,
      }));
    }
  };

  const handleSiteChange = (event, value) => {
    setSelectedSite(value);
    setSelectedSystem(null);
    setRequestForm((prevForm) => ({
      ...prevForm,
      idSite: value ? value.id : "",
      idSystem: "",
    }));

    if (value && value.systems.length === 1) {
      setSelectedSystem(value.systems[0]);
      setRequestForm((prevForm) => ({
        ...prevForm,
        idSystem: value.systems[0].id,
      }));
    }
  };

  const handleSystemChange = (event, value) => {
    setSelectedSystem(value);
    setRequestForm((prevForm) => ({
      ...prevForm,
      idSystem: value ? value.id : "",
    }));
  };

  const handleRequestTypeChange = (event, value) => {
    setSelectedRequestType(value);
    setRequestForm((prevForm) => ({
      ...prevForm,
      type: value ? value.id : "",
    }));
  };

  return (
    <CustomContainer>
      <Header />
      <CustomMain>
        <Typography variant="h4" component="h1" gutterBottom>
          Solicitudes
        </Typography>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          {((canEditRequest && !isSupervisor) || (roleId === 5)) && (
            <Button
              variant="contained"
              onClick={() => {
                setSelectedRequest(null);
                setRequestForm({
                  idSite: "",
                  code: "",
                  type: "",
                  scope: "",
                  idSystem: "",
                });
                if (clients.length === 1) {
                  handleClientChange(null, clients[0]);
                } else {
                  setSelectedClient(null);
                  setSelectedSite(null);
                  setSelectedSystem(null);
                  setSelectedRequestType(null);
                }

                setOpenRequestForm(true);
              }}
            >
              Crear solicitud
            </Button>
          )}
          <TextField
            label="Buscar"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <Grid container spacing={2}>
          {filterRequests().map((request) => (
            <Grid item xs={12} sm={6} md={4} key={request.id}>
              <CustomCard sx={{ position: 'relative' }}>
                {request.idStatus === 6 && (
                  <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}
                  >
                  </Box>
                )}
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Typography
                      variant="h6"
                      component="span"
                      style={{ fontWeight: 'bold' }}
                      color={request.code ? 'inherit' : 'error'}
                    >
                      {request.code || 'Código sin asignar'}
                    </Typography>
                    {request.idStatus === 1 && (
                      <NewReleasesIcon color="primary" sx={{ ml: 1 }} />
                    )}
                    {request.idStatus === 5 && (
                      <ReportProblemIcon color="error" sx={{ ml: 1 }} />
                    )}
                  </Box>
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
                  <Typography color="textSecondary">
                    {request.statusName}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleRequestClick(request)}>
                    Ver detalles
                  </Button>
                  {(canEditRequest || roleId === 4) && (
                    <IconButton
                      size="small"
                      aria-label="more"
                      aria-controls={`long-menu-${request.id}`}
                      aria-haspopup="true"
                      onClick={(event) => handleMenuOpen(event, request)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                </CardActions>
              </CustomCard>
            </Grid>
          ))}
        </Grid>
        <Menu
          id={`long-menu-${selectedRequest?.id}`}
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          sx={{
            '& .MuiMenu-paper': {
              maxHeight: ITEM_HEIGHT * 4.5,
              minWidth: '200px',
              boxShadow: 'none',
            },
            '& .MuiMenu-list': {
              padding: 0,
            },
          }}
        >
          {((canEditRequest && (selectedRequest?.idStatus === 1 || selectedRequest?.idStatus === 2 || selectedRequest?.idStatus === 3)) || roleId === 1) && [
            <MenuItem
              key="edit"
              onClick={() => {
                handleEditRequest(selectedRequest);
                handleMenuClose();
              }}
            >
              Editar
            </MenuItem>,
            <MenuItem
              key="delete"
              onClick={() => {
                handleDeleteRequest(selectedRequest);
                handleMenuClose();
              }}
            >
              Eliminar
            </MenuItem>,
          ]}
          {selectedRequest && (canEditRequest && (selectedRequest.idStatus === 1 || selectedRequest.idStatus === 2 || selectedRequest.idStatus === 3)) && (
            <MenuItem
              onClick={() => {
                handleAssignDateTime(selectedRequest);
                handleMenuClose();
              }}
            >
              {selectedRequest.tentativeDate || selectedRequest.tentativeTime
                ? 'Reasignar fecha tentativa'
                : 'Asignar fecha tentativa'}
            </MenuItem>
          )}
          {selectedRequest && (canEditRequest && (selectedRequest.idStatus === 1 || selectedRequest.idStatus === 2 || selectedRequest.idStatus === 3)) && (
            <MenuItem
              onClick={() => {
                handleAssignTechnician(selectedRequest);
                handleMenuClose();
              }}
            >
              {selectedRequest.idStatus === 1 ? 'Asignar técnico' : 'Reasignar técnico'}
            </MenuItem>
          )}
          {(roleId === 3 || roleId === 4) && [
            selectedRequest && selectedRequest.idStatus === 2 && (
              <MenuItem
                key="acknowledge"
                onClick={() => {
                  setSelectedRequest(selectedRequest);
                  setOpenAcknowledgeConfirmation(true);
                  handleMenuClose();
                }}
              >
                Reconocer
              </MenuItem>
            ),
            selectedRequest && selectedRequest.idStatus === 3 && (
              <MenuItem
                key="start"
                onClick={() => {
                  setSelectedRequest(selectedRequest);
                  setOpenStartConfirmation(true);
                  handleMenuClose();
                }}
              >
                Iniciar
              </MenuItem>
            ),
          ]}
          {selectedRequest && selectedRequest.idStatus === 4 && (roleId === 3 || roleId === 4) && (
            <MenuItem onClick={() => handleFinishRequest(selectedRequest)}>
              Finalizar Solicitud
            </MenuItem>
          )}
          {selectedRequest && (selectedRequest.idStatus === 5 || selectedRequest.idStatus === 6) && canEditRequest && [
            <MenuItem key="downloadTicket" onClick={() => downloadFile(`requests/${selectedRequest.id}/ticket`, 'ticket')}>
              Descargar Boleta
            </MenuItem>,
            selectedRequest.idType === 2 && (
              <MenuItem key="downloadReport" onClick={() => downloadFile(`requests/${selectedRequest.id}/report`, 'report')}>
                Descargar Reporte
              </MenuItem>
            ),
          ]}
          {selectedRequest && selectedRequest.idStatus === 5 && canEditRequest && [
            <MenuItem key="reuploadFiles" onClick={() => handleFinishRequest(selectedRequest)}>
              Resubir archivos
            </MenuItem>,
            <MenuItem key="closeRequest" onClick={() => handleCloseRequest(selectedRequest)}>
              Cerrar solicitud
            </MenuItem>,
          ]}
        </Menu>
      </CustomMain>

      {/* Request Details Dialog */}
      <Dialog open={openRequestDialog} onClose={() => setOpenRequestDialog(false)}>
        {selectedRequest && (
          <>
            <DialogTitle>
              {selectedRequest.code ? (
                selectedRequest.code
              ) : (
                <Typography color="error">Código sin asignar</Typography>
              )}
            </DialogTitle>
            <DialogContent>
              <Box mb={2}>
                <Typography>
                  <strong>Cliente:</strong> {selectedRequest.clientName}
                </Typography>
                <Typography>
                  <strong>Sitio:</strong> {selectedRequest.siteName}
                </Typography>
                <Typography>
                  <strong>Sistema:</strong> {selectedRequest.systemName}
                </Typography>
                <Typography>
                  <strong>Tipo de solicitud:</strong> {selectedRequest.requestTypeName}
                </Typography>
                <Typography>
                  {roleId === 5 ? (
                    <strong>Descripción del problema:</strong>
                  ) : (
                    <strong>Alcance:</strong>
                  )}{" "}
                  {selectedRequest.scope}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography>
                  <strong>Estado de solicitud:</strong> {selectedRequest.statusName}
                </Typography>
                {selectedRequest.supervisorName && (

                  <Typography>
                    <strong>Supervisor:</strong> {selectedRequest.supervisorName}
                  </Typography>

                )}
                {selectedRequest.technicianFullName && (
                  <Typography>
                    <strong>Técnico asignado:</strong>{" "}
                    {selectedRequest.technicianFullName}
                  </Typography>
                )}
              </Box>

              <Box mb={2}>
                <Typography>
                  <strong>Fecha tentativa de ejecución:</strong>{" "}
                  {selectedRequest.tentativeDate
                    ? formatDate(selectedRequest.tentativeDate)
                    : "Sin asignar"}
                </Typography>
                <Typography>
                  <strong>Hora tentativa de ejecución:</strong>{" "}
                  {selectedRequest.tentativeTime
                    ? formatTime(selectedRequest.tentativeTime)
                    : "Sin asignar"}
                </Typography>
              </Box>

              {selectedRequest.technicianAcknowledgeDatetime && (
                <Box mb={2}>
                  <Typography>
                    <strong>Fecha de confirmación del técnico:</strong>{" "}
                    {formatDateTime(selectedRequest.technicianAcknowledgeDatetime)}
                  </Typography>
                  {selectedRequest.technicianStartingWorkDatetime && (
                    <Typography>
                      <strong>Fecha de inicio del técnico:</strong>{" "}
                      {formatDateTime(selectedRequest.technicianStartingWorkDatetime)}
                    </Typography>
                  )}
                  {selectedRequest.technicianFinishWorkDatetime && (
                    <Typography>
                      <strong>Fecha de finalización:</strong>{" "}
                      {formatDateTime(selectedRequest.technicianFinishWorkDatetime)}
                    </Typography>
                  )}
                </Box>
              )}

              <Box mb={2}>
                <Typography>
                  <strong>Creado por:</strong> {selectedRequest.createdBy}
                </Typography>
                <Typography>
                  <strong>Fecha de creación:</strong>{" "}
                  {formatDateTime(selectedRequest.createdAt)}
                </Typography>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Request Form Dialog */}
      <Dialog open={openRequestForm} onClose={() => setOpenRequestForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedRequest ? "Editar solicitud" : "Crear solicitud"}
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            options={clients}
            getOptionLabel={(client) => client?.name || ""}
            value={clients.length === 1 ? clients[0] : selectedClient}
            onChange={handleClientChange}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField {...params} label="Cliente" margin="normal" disabled={clients.length === 1} />
            )}
            disabled={clients.length === 1}
          />
          {selectedClient && (
            <Autocomplete
              options={selectedClient.sites}
              getOptionLabel={(site) => site?.name || ""}
              value={selectedClient.sites.length === 1 ? selectedClient.sites[0] : selectedSite}
              onChange={handleSiteChange}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField {...params} label="Sitio" margin="normal" disabled={selectedClient.sites.length === 1} />
              )}
              disabled={selectedClient.sites.length === 1}
            />
          )}
          {selectedSite && (
            <Autocomplete
              options={selectedSite.systems}
              getOptionLabel={(system) => system?.name || ""}
              value={selectedSite.systems.length === 1 ? selectedSite.systems[0] : selectedSystem}
              onChange={handleSystemChange}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField {...params} label="Sistema" margin="normal" disabled={selectedSite.systems.length === 1} />
              )}
              disabled={selectedSite.systems.length === 1}
            />
          )}
          {roleId !== 5 && (
            <TextField
              fullWidth
              margin="normal"
              label="Código"
              name="code"
              value={requestForm.code}
              onChange={(e) =>
                setRequestForm({ ...requestForm, code: e.target.value })
              }
              required
            />
          )}
          {roleId !== 5 && (
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
          )}
          <TextareaAutosize
            minRows={4}
            placeholder={roleId === 5 ? "Descripción del problema" : "Alcance"}
            name="scope"
            value={requestForm.scope}
            onChange={(e) => setRequestForm({ ...requestForm, scope: e.target.value })}
            required
            style={{
              width: '100%',
              resize: 'vertical',
              fontFamily: 'Roboto, Arial, sans-serif',
              fontSize: '16px',
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid rgba(0, 0, 0, 0.23)',
              marginTop: '8px',
              marginBottom: '16px',
              boxSizing: 'border-box',
              '&:focus': {
                outline: 'none',
                borderColor: '#3f51b5',
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRequestForm(false)}>Cancelar</Button>
          <Button
            onClick={handleRequestFormSubmit}
            disabled={isRequestFormButtonDisabled()}
          >
            {selectedRequest ? "Actualizar" : "Crear"}
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
            ¿Estás seguro que deseas eliminar la solicitud "
            {selectedRequest?.code}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDelete(false)}>Cancelar</Button>
          <Button onClick={confirmDeleteRequest} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Technician Dialog */}
      <Dialog
        open={openAssignTechnicianDialog}
        onClose={() => setOpenAssignTechnicianDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedRequest?.idStatus === 1 ? "Asignar técnico" : "Reasignar técnico"}
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            options={technicians}
            getOptionLabel={(technician) =>
              `${technician.name} ${technician.lastname}`
            }
            value={selectedTechnician}
            onChange={handleTechnicianChange}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField {...params} label="Técnico" margin="normal" />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignTechnicianDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAssignTechnicianSubmit}>Asignar</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openAcknowledgeConfirmation}
        onClose={() => setOpenAcknowledgeConfirmation(false)}
      >
        <DialogTitle>Confirmar reconocimiento</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas reconocer la solicitud "
            {selectedRequest?.code}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAcknowledgeConfirmation(false)}>Cancelar</Button>
          <Button onClick={handleAcknowledgeRequest} color="primary">
            Reconocer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Start Confirmation Dialog */}
      <Dialog
        open={openStartConfirmation}
        onClose={() => setOpenStartConfirmation(false)}
      >
        <DialogTitle>Confirmar inicio</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas iniciar la solicitud "
            {selectedRequest?.code}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStartConfirmation(false)}>Cancelar</Button>
          <Button onClick={handleStartRequest} color="primary">
            Iniciar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Finish Request Dialog */}
      <Dialog
        open={openFinishRequestDialog}
        onClose={() => {
          setOpenFinishRequestDialog(false);
          setTicketFile(null);
          setReportFile(null);
        }}
      >
        <DialogTitle>Finalizar Solicitud</DialogTitle>
        <DialogContent>
          <Typography>Por favor, sube los siguientes archivos:</Typography>
          <Box mb={1}></Box>
          <Typography>Boleta</Typography>
          <input
            type="file"
            accept=".pdf,.xlsx,.xls,.xlsb"
            onChange={(e) => setTicketFile(e.target.files[0])}
          />

          {selectedRequest?.idType === 2 && (
            <>
              <Typography>Informe</Typography>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setReportFile(e.target.files[0])}
              />

            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFinishRequestDialog(false)}>Cancelar</Button>
          <Button
            onClick={() => setOpenConfirmFinish(true)}
            disabled={
              selectedRequest?.idStatus === 5
                ? !ticketFile && !reportFile
                : !ticketFile || (selectedRequest?.idType === 2 && !reportFile)
            }
          >
            Finalizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Finish Dialog */}
      <Dialog open={openConfirmFinish} onClose={() => setOpenConfirmFinish(false)}>
        <DialogTitle>Confirmar finalización</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas finalizar la solicitud "{selectedRequest?.code}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmFinish(false)}>Cancelar</Button>
          <Button onClick={confirmFinishRequest} color="primary">
            Finalizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Close Dialog */}
      <Dialog open={openCloseConfirmation} onClose={() => setOpenCloseConfirmation(false)}>
        <DialogTitle>Confirmar cierre</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas cerrar la solicitud "{selectedRequest?.code}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCloseConfirmation(false)}>Cancelar</Button>
          <Button onClick={confirmCloseRequest} color="primary">
            Cerrar
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
      <Dialog
        open={openAssignDateTimeDialog}
        onClose={() => {
          setOpenAssignDateTimeDialog(false);
          setSelectedDateTime({ date: '', time: '' });
        }}
      >
        <DialogTitle>Asignar fecha y hora tentativa</DialogTitle>
        <DialogContent>
          <TextField
            label="Fecha"
            type="date"
            value={selectedDateTime.date}
            onChange={(e) => setSelectedDateTime({ ...selectedDateTime, date: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Hora"
            type="time"
            value={selectedDateTime.time}
            onChange={(e) => setSelectedDateTime({ ...selectedDateTime, time: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDateTimeDialog(false)}>Cancelar</Button>
          <Button onClick={handleAssignDateTimeSubmit} disabled={!selectedDateTime.date}>
            Asignar
          </Button>
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

export default RequestPage;