const express = require('express');
const db = require('./db/db');
const { register, login, logout, resetPassword, forgotPassword } = require('./auth');
require('dotenv').config();
//const mail = require('./models/email')

const requestsRouter = require('./routes/requests');
const clientsRouter = require('./routes/clients');
const sitesRouter = require('./routes/sites');
const systemsRouter = require('./routes/systems');
const usersRouter = require('./routes/users');
const techniciansRouter = require('./routes/technicians');

const app = express();
app.use(express.json());

app.post('/register', register);
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
});