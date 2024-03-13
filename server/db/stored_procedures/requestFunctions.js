const sql = require('mssql');
const { executeSp } = require('../db');

async function createRequest(idSite, code, type, scope, createdBy, idSystem, idSystemType) {
  return await executeSp('sp_CreateRequest', [
    { name: 'idSite', value: idSite, type: sql.Int },
    { name: 'code', value: code, type: sql.VarChar(50) },
    { name: 'type', value: type, type: sql.SmallInt },
    { name: 'scope', value: scope, type: sql.VarChar(500) },
    { name: 'createdBy', value: createdBy, type: sql.Int },
    { name: 'idSystem', value: idSystem, type: sql.SmallInt },
    { name: 'idSystemType', value: idSystemType, type: sql.SmallInt }
  ]);
}

async function getRequestPerClient(idClient) {
  return await executeSp('sp_GetRequestPerClient', [
    { name: 'idClient', value: idClient, type: sql.Int }
  ]);
}

async function getRequestPerSite(idSite) {
  return await executeSp('sp_GetRequestPerSite', [
    { name: 'idSite', value: idSite, type: sql.Int }
  ]);
}

async function getRequestById(idRequest) {
  return await executeSp('sp_GetRequestById', [
    { name: 'idRequest', value: idRequest, type: sql.BigInt }
  ]);
}

async function getRequestsByAssignedTechnician(idTechnician) {
  return await executeSp('sp_GetRequestsByAssignedTechnician', [
    { name: 'idTechnician', value: idTechnician, type: sql.Int }
  ]);
}

async function getRequests() {
  return await executeSp('sp_GetRequests');
}

async function updateRequest(id, idSite, code, type, scope, idSystem) {
  return await executeSp('sp_UpdateRequest', [
    { name: 'id', value: id, type: sql.BigInt },
    { name: 'idSite', value: idSite, type: sql.Int },
    { name: 'code', value: code, type: sql.VarChar(50) },
    { name: 'type', value: type, type: sql.SmallInt },
    { name: 'scope', value: scope, type: sql.VarChar(500) },
    { name: 'idSystem', value: idSystem, type: sql.SmallInt }
  ]);
}

async function assignTechnicianToRequest(idRequest, idTechnician) {
  return await executeSp('sp_AssignTechnicianToRequest', [
    { name: 'idRequest', value: idRequest, type: sql.BigInt },
    { name: 'idTechnician', value: idTechnician, type: sql.Int }
  ]);
}

async function acknowledgeRequestByTechnician(idRequest, idTechnician) {
  return await executeSp('sp_AcknowledgeRequestByTechnician', [
    { name: 'idRequest', value: idRequest, type: sql.BigInt },
    { name: 'roleidTechnicianId', value: idTechnician, type: sql.Int }
  ]);
}

async function startRequestByTechnician(idRequest, idTechnician) {
  return await executeSp('sp_StartRequestByTechnician', [
    { name: 'idRequest', value: idRequest, type: sql.BigInt },
    { name: 'roleidTechnicianId', value: idTechnician, type: sql.Int }
  ]);
}

module.exports = {
  create: createRequest,
  getByClient: getRequestPerClient,
  getBySite: getRequestPerSite,
  getByAssignedTechnician: getRequestsByAssignedTechnician,
  getById: getRequestById, 
  getAll: getRequests,
  update: updateRequest,
  assignTechnician: assignTechnicianToRequest,
  acknowledgeTechnician: acknowledgeRequestByTechnician,
  startTechnician: startRequestByTechnician,
};