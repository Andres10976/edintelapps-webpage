// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');

  if (!token) {
    // If the token doesn't exist, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  try {
    // Decode the token to get the user's role and expiration time
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert current time to seconds

    if (decodedToken.exp < currentTime) {
      // If the token has expired, remove it from local storage and redirect to the login page
      localStorage.removeItem('token');
      return <Navigate to="/login" replace />;
    }

    const userRole = decodedToken.roleId;

    // Check if the user's role is in the list of allowed roles
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // If the user's role is not allowed, redirect to an unauthorized page or the login page
      return <Navigate to="/unauthorized" replace />;
    }

    // If the user's role is allowed, render the child component
    return children;
  } catch (error) {
    // If there's an error decoding the token, redirect to the login page
    return <Navigate to="/login" replace />;
  }
}

export default PrivateRoute;