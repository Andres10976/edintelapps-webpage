const express = require('express');
const cors = require('cors');
const { register, login, logout, resetPassword, forgotPassword, authenticateRole } = require('./auth');
require('dotenv').config();
const {sendEmail} = require('./utils/mailHelper')
const corsOptions = {
  origin: '*', // Only allow requests from your frontend
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};


const requestsRouter = require('./routes/requests');
const clientsRouter = require('./routes/clients');
const sitesRouter = require('./routes/sites');
const systemsRouter = require('./routes/systems');
const usersRouter = require('./routes/users');
const techniciansRouter = require('./routes/technicians');

const app = express();
app.use(express.json());

app.use(cors(corsOptions)); 

app.post('/register', authenticateRole(1,2), register);
app.post('/login', login);
app.post('/logout', logout);
app.post('/reset-password', resetPassword);
app.post('/forgot-password', forgotPassword);


app.use('/requests', requestsRouter);
app.use('/clients', clientsRouter);
app.use('/sites', sitesRouter);
app.use('/systems', systemsRouter);
app.use('/users', usersRouter);
app.use('/technicians', techniciansRouter);

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
  //sendEmail("andres.villalobos@edintel.com", "Prueba de correo", "Cristo Vive Costa Rica!");
});