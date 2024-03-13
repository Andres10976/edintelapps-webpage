const sql = require('mssql');
const { executeSp } = require('../db');

async function createSite(idClient, name, supervisor) {
  return await executeSp('sp_CreateSite', [
    { name: 'idClient', value: idClient, type: sql.Int },
    { name: 'name', value: name, type: sql.VarChar(50) },
    { name: 'supervisor', value: supervisor, type: sql.Int }
  ]);
}

async function getSites() {
  return await executeSp('sp_GetSites');
}

async function getSiteById(id) {
  return await executeSp('sp_GetSiteById', [
    { name: 'id', value: id, type: sql.Int }
  ]);
}


async function getSitesPerClient(idClient) {
  return await executeSp('sp_GetSitesPerClient', [
    { name: 'idClient', value: idClient, type: sql.Int }
  ]);
}

async function updateSite(id, name, supervisor, isActive) {
  return await executeSp('sp_UpdateSite', [
    { name: 'id', value: id, type: sql.Int },
    { name: 'name', value: name, type: sql.VarChar(50) },
    { name: 'supervisor', value: supervisor, type: sql.Int },
    { name: 'isActive', value: isActive, type: sql.Bit }
  ]);
}

async function assignSystemToSite(idSite, idSystem, idSystemType) {
  return await executeSp('sp_AssignSystemToSite', [
    { name: 'idSite', value: idSite, type: sql.Int },
    { name: 'idSystem', value: idSystem, type: sql.SmallInt },
    { name: 'idSystemType', value: idSystemType, type: sql.SmallInt }
  ]);
}

async function disassociateSiteToSystem(idSite, idSystem, idSystemType) {
  return await executeSp('sp_DisassociateSiteToSystem', [
    { name: 'idSite', value: idSite, type: sql.Int },
    { name: 'idSystem', value: idSystem, type: sql.SmallInt },
    { name: 'idSystemType', value: idSystemType, type: sql.SmallInt }
  ]);
}

module.exports = {
  create: createSite,
  getAll: getSites,
  getById: getSiteById,
  getByClient: getSitesPerClient,
  update: updateSite,
  assignSystem: assignSystemToSite,
  disassociateSystem: disassociateSiteToSystem
};