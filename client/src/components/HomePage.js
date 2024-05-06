// HomePage.js
import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import Header from './Header';
import { jwtDecode } from 'jwt-decode';
import { CustomMain, CustomContainer } from "./styledComponents";
import { useMediaQuery, useTheme } from '@mui/material';
import axiosInstance from "../axiosInstance";

function HomePage() {
  const token = localStorage.getItem('token');
  const decodedToken = jwtDecode(token);
  const [clientName, setClientName] = useState(null);
  const [siteName, setSiteName] = useState(null);

  useEffect(() => {
    const fetchClientName = async () => {
      try {
        const clientRequest = await axiosInstance.get(`/clients/${decodedToken.clientId}`);
        setClientName(clientRequest.data.name);
      } catch (error) {
        console.error("Error fetching client name:", error);
      }
    };

    const fetchSiteName = async () => {
      try {
        const siteRequest = await axiosInstance.get(`/sites/${decodedToken.siteId}`);
        setSiteName(siteRequest.data.at(0).name);
      } catch (error) {
        console.error("Error fetching site name:", error);
      }
    };

    if (decodedToken.clientId) {
      fetchClientName();
    }
    if (decodedToken.siteId) {
      fetchSiteName();
    }
  }, [decodedToken.clientId, decodedToken.siteId]);

  return (
    <CustomContainer>
      <Header />
      <CustomMain>
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          ¡Bienvenido de vuelta, {decodedToken.name}!
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', flexDirection: useMediaQuery(useTheme().breakpoints.down('sm')) ? 'column' : 'row' }}>
          <div style={{ textAlign: 'center', marginRight: useMediaQuery(useTheme().breakpoints.down('sm')) ? 0 : '2rem', marginBottom: useMediaQuery(useTheme().breakpoints.down('sm')) ? '1rem' : 0 }}>
            {clientName && (
              <>
                <Typography variant="h5" gutterBottom>
                  Cliente asociado
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {clientName}
                </Typography>
              </>
            )}
          </div>
          <div style={{ textAlign: 'center', marginLeft: useMediaQuery(useTheme().breakpoints.down('sm')) ? 0 : '2rem' }}>
            {siteName && (
              <>
                <Typography variant="h5" gutterBottom>
                  Sitio asociado
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {siteName}
                </Typography>
              </>
            )}
          </div>
        </div>
      </CustomMain>
    </CustomContainer>
  );
}

export default HomePage;