// RequestsPage.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Grid, Card, CardContent, Modal, DialogContent, DialogActions,  DialogTitle, Dialog } from '@mui/material';
import { styled } from '@mui/system';
import Header from './Header';
import axiosInstance from '../axiosInstance';


const RequestsPageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
}));

const Main = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(4),
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const RequestCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    idSite: '',
    code: '',
    type: '',
    scope: '',
    idSystem: '',
    idSystemType: '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axiosInstance.get('/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredRequests = requests.filter((request) => {
    const { siteName, code, systemName, systemTypeName, requestTypeName, statusName, createdByUsername, fullName } = request;
    const searchTermLower = searchTerm.toLowerCase();
    return (
      siteName.toLowerCase().includes(searchTermLower) ||
      code.toLowerCase().includes(searchTermLower) ||
      systemName.toLowerCase().includes(searchTermLower) ||
      systemTypeName.toLowerCase().includes(searchTermLower) ||
      requestTypeName.toLowerCase().includes(searchTermLower) ||
      statusName.toLowerCase().includes(searchTermLower) ||
      createdByUsername.toLowerCase().includes(searchTermLower) ||
      fullName.toLowerCase().includes(searchTermLower)
    );
  });

  const handleCreateRequest = () => {
    setOpenCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    setNewRequest({
      idSite: '',
      code: '',
      type: '',
      scope: '',
      idSystem: '',
      idSystemType: '',
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewRequest((prevRequest) => ({
      ...prevRequest,
      [name]: value,
    }));
  };

  const handleSubmitRequest = async () => {
    try {
      await axiosInstance.post('/requests', newRequest);
      handleCloseCreateModal();
      fetchRequests();
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };


  const handleRequestClick = async (requestId) => {
    try {
      const response = await axiosInstance.get(`/requests/${requestId}`);
      setSelectedRequest(response.data);
      setOpenModal(true);
    } catch (error) {
      console.error('Error fetching request details:', error);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRequest(null);
  };

  return (
    <RequestsPageContainer>
      <Header />
      <Main>
        <Typography variant="h4" component="h1" gutterBottom>
          Requests
        </Typography>
        <SearchContainer>
          <TextField
            label="Search"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ marginRight: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleCreateRequest}>
            Create Request
          </Button>
        </SearchContainer>
        <Grid container spacing={2}>
          {filteredRequests.map((request) => (
            <Grid item xs={12} sm={6} md={4} key={request.id}>
              <RequestCard onClick={() => handleRequestClick(request.id)}>
                <CardContent>
                  <Typography variant="h6">{request.code}</Typography>
                  <Typography variant="body2">Site: {request.siteName}</Typography>
                  <Typography variant="body2">System: {request.systemName}</Typography>
                  <Typography variant="body2">Status: {request.statusName}</Typography>
                </CardContent>
              </RequestCard>
            </Grid>
          ))}
        </Grid>
      </Main>
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          {selectedRequest && (
            <>
              <Typography variant="h6" gutterBottom>
                Request Details
              </Typography>
              <Typography variant="body1">Code: {selectedRequest.code}</Typography>
              <Typography variant="body1">Site: {selectedRequest.siteName}</Typography>
              <Typography variant="body1">System: {selectedRequest.systemName}</Typography>
              <Typography variant="body1">System Type: {selectedRequest.systemTypeName}</Typography>
              <Typography variant="body1">Request Type: {selectedRequest.requestTypeName}</Typography>
              <Typography variant="body1">Status: {selectedRequest.statusName}</Typography>
              <Typography variant="body1">Created By: {selectedRequest.createdByUsername}</Typography>
              <Typography variant="body1">Assigned To: {selectedRequest.fullName}</Typography>
            </>
          )}
        </Box>
      </Modal>
      <Dialog open={openCreateModal} onClose={handleCloseCreateModal}>
        <DialogTitle>Create Request</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="idSite"
            label="Site ID"
            fullWidth
            value={newRequest.idSite}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="code"
            label="Code"
            fullWidth
            value={newRequest.code}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="type"
            label="Type"
            fullWidth
            value={newRequest.type}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="scope"
            label="Scope"
            fullWidth
            value={newRequest.scope}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="idSystem"
            label="System ID"
            fullWidth
            value={newRequest.idSystem}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="idSystemType"
            label="System Type ID"
            fullWidth
            value={newRequest.idSystemType}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateModal}>Cancel</Button>
          <Button onClick={handleSubmitRequest}>Create</Button>
        </DialogActions>
      </Dialog>
    </RequestsPageContainer>
  );
}

export default RequestsPage;