const sql = require('mssql');
const { executeSp } = require('../db');

async function createClient(name, phone, email, contactName, contactLastName, contactPhone, contactEmail) {
  return await executeSp('sp_CreateClient', [
    { name: 'name', value: name, type: sql.VarChar(50) },
    { name: 'phone', value: phone, type: sql.VarChar(20) },
    { name: 'email', value: email, type: sql.VarChar(255) },
    { name: 'contactName', value: contactName, type: sql.VarChar(50) },
    { name: 'contactLastName', value: contactLastName, type: sql.VarChar(50) },
    { name: 'contactPhone', value: contactPhone, type: sql.VarChar(20) },
    { name: 'contactEmail', value: contactEmail, type: sql.VarChar(255) }
  ]);
}

async function getClients() {
  return await executeSp('sp_GetClients');
}

async function getClientById(clientId) {
  return await executeSp('sp_GetClientById', [
    { name: 'clientId', value: clientId, type: sql.Int }
  ]);
}

async function updateClient(clientId, name, phone, email, contactName, contactLastName, contactPhone, contactEmail) {
  return await executeSp('sp_UpdateClient', [
    { name: 'clientId', value: clientId, type: sql.Int },
    { name: 'name', value: name, type: sql.VarChar(50) },
    { name: 'phone', value: phone, type: sql.VarChar(20) },
    { name: 'email', value: email, type: sql.VarChar(255) },
    { name: 'contactName', value: contactName, type: sql.VarChar(50) },
    { name: 'contactLastName', value: contactLastName, type: sql.VarChar(50) },
    { name: 'contactPhone', value: contactPhone, type: sql.VarChar(20) },
    { name: 'contactEmail', value: contactEmail, type: sql.VarChar(255) }
  ]);
}

module.exports = {
  create: createClient,
  getAll: getClients,
  get: getClientById,
  update: updateClient
};