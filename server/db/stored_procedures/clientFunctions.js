const sql = require('mssql');
const { executeSp } = require('../db');


async function createClient(name, idCompany) {
  try {
    const result = await executeSp('sp_CreateClient', [
      { name: 'name', value: name, type: sql.VarChar(50) },
      { name: 'idCompany', value: idCompany, type: sql.Int },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getClients() {
  const result = await executeSp('sp_GetClients');
  return result;
}


async function getClientById(idClient) {
  const result = await executeSp('sp_GetClientById', [
    { name: 'clientId', value: idClient, type: sql.Int }
  ]);
  return result.at(0);
}

async function getClientsByCompany(idCompany) {
  const result = await executeSp('sp_GetClientByCOmpany', [
    { name: 'idCompany', value: idCompany, type: sql.Int }
  ]);
  return result.at(0);
}

async function deleteClient(clientId) {
  try {
    const result = await executeSp('sp_DeleteClient', [
      { name: 'id', value: clientId, type: sql.Int }
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function updateClient(clientId, name, idCompany) {
  try {
    const result = await executeSp('sp_UpdateClient', [
      { name: 'clientId', value: clientId, type: sql.Int },
      { name: 'name', value: name, type: sql.VarChar(50) },
      { name: 'companyId', value: idCompany, type: sql.Int },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  create: createClient,
  getAll: getClients,
  get: getClientById,
  getByCompany: getClientsByCompany,
  update: updateClient,
  delete: deleteClient
};