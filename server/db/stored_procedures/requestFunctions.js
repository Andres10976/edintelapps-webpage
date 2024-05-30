const sql = require("mssql");
const { executeSp } = require("../db");


async function createRequest(idSite, code, type, scope, createdBy, idSystem) {
  try {
    const result = await executeSp("sp_CreateRequest", [
      { name: "idSite", value: idSite, type: sql.Int },
      { name: "code", value: code, type: sql.VarChar(50) },
      { name: "type", value: type, type: sql.SmallInt },
      { name: "scope", value: scope, type: sql.VarChar(500) },
      { name: "createdBy", value: createdBy, type: sql.Int },
      { name: "idSystem", value: idSystem, type: sql.SmallInt },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getRequestsByCompany(idCompany) {
  try {
    const result = await executeSp("sp_GetRequestsByCompany", [
      { name: "idCompany", value: idCompany, type: sql.Int },
    ]);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getRequestsByClient(idClient) {
  try {
    const result = await executeSp("sp_GetRequestsByClient", [
      { name: "idClient", value: idClient, type: sql.Int },
    ]);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}


async function getRequestBySite(idSite) {
  try {
    const result = await executeSp("sp_GetRequestBySite", [
      { name: "idSite", value: idSite, type: sql.Int },
    ]);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getRequestById(idRequest) {
  try {
    const result = await executeSp("sp_GetRequestById", [
      { name: "idRequest", value: idRequest, type: sql.BigInt },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function deleteRequest(idRequest) {
  try {
    const result = await executeSp("sp_DeleteRequest", [
      { name: "id", value: idRequest, type: sql.BigInt },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}


async function getRequestsByAssignedTechnician(idTechnician) {
  try {
    const result = await executeSp("sp_GetRequestsByAssignedTechnician", [
      { name: "idTechnician", value: idTechnician, type: sql.Int },
    ]);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}


async function getRequests() {
  try {
    const result = await executeSp("sp_GetRequests");
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}


async function updateRequest(id, idSite, code, type, scope, idSystem) {
  try {
    const result = await executeSp("sp_UpdateRequest", [
      { name: "id", value: id, type: sql.BigInt },
      { name: "idSite", value: idSite, type: sql.Int },
      { name: "code", value: code, type: sql.VarChar(50) },
      { name: "type", value: type, type: sql.SmallInt },
      { name: "scope", value: scope, type: sql.VarChar(500) },
      { name: "idSystem", value: idSystem, type: sql.SmallInt },

    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}


async function assignTentativeDateTime(id, tentativeDate, tentativeTime) {
  try {
    const result = await executeSp("sp_AssignTentativeDateTime", [
      { name: "idRequest", value: id, type: sql.BigInt },
      { name: "tentativeDate", value: tentativeDate, type: sql.Date },
      { name: "tentativeTime", value: tentativeTime, type: sql.VarChar(20) },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}


async function assignTicketAndReportPathToRequest(id, ticket = null, report = null) {
  try {
    const result = await executeSp("sp_AssignTicketAndReportToRequest", [
      { name: "idRequest", value: id, type: sql.BigInt },
      { name: "ticket", value: ticket, type: sql.VarChar(255) },
      { name: "report", value: report, type: sql.VarChar(255) },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}


async function getTicketPathOfRequest(id) {
  try {
    const result = await executeSp("sp_GetTicketFromRequest", [
      { name: "idRequest", value: id, type: sql.BigInt },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}


async function getReportPathOfRequest(id) {
  try {
    const result = await executeSp("sp_GetReportFromRequest", [
      { name: "idRequest", value: id, type: sql.BigInt },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}


async function assignTechnicianToRequest(idRequest, idTechnician) {
  try {
    const result = await executeSp("sp_AssignTechnicianToRequest", [
      { name: "idRequest", value: idRequest, type: sql.BigInt },
      { name: "idTechnician", value: idTechnician, type: sql.Int },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}


async function acknowledgeRequestByTechnician(idRequest, idTechnician) {
  try {
    const result = await executeSp("sp_AcknowledgeRequestByTechnician", [
      { name: "idRequest", value: idRequest, type: sql.BigInt },
      { name: "idTechnician", value: idTechnician, type: sql.Int },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}


async function startRequestByTechnician(idRequest, idTechnician) {
  try {
    const result = await executeSp("sp_StartRequestByTechnician", [
      { name: "idRequest", value: idRequest, type: sql.BigInt },
      { name: "idTechnician", value: idTechnician, type: sql.Int },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}


async function getRequestTypes() {
  try {
    const result = await executeSp("sp_GetRequestTypes");
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}


async function getRequestStatus() {
  try {
    const result = await executeSp("sp_GetRequestStatuses");
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}


async function closeRequest(idRequest) {
  try {
    const result = await executeSp("sp_CloseRequestById", [
      { name: "idRequest", value: idRequest, type: sql.BigInt },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  create: createRequest,
  getByCompany: getRequestsByCompany,
  getByClient: getRequestsByClient,
  getBySite: getRequestBySite,
  getByAssignedTechnician: getRequestsByAssignedTechnician,
  getById: getRequestById,
  getAll: getRequests,
  update: updateRequest,
  assignTechnician: assignTechnicianToRequest,
  acknowledgeTechnician: acknowledgeRequestByTechnician,
  startTechnician: startRequestByTechnician,
  delete: deleteRequest,
  getTypes: getRequestTypes,
  getStatus: getRequestStatus,
  assignTentativeDateTime,
  assignTicketAndReportPathToRequest,
  getReportPathOfRequest,
  getTicketPathOfRequest,
  close: closeRequest
};
