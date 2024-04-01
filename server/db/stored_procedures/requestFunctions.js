const sql = require("mssql");
const { executeSp } = require("../db");

/**
 * Creates a new request.
 * @param {number} idSite - The ID of the site.
 * @param {string} code - The code of the request.
 * @param {number} type - The type of the request.
 * @param {string} scope - The scope of the request.
 * @param {number} createdBy - The ID of the user who created the request.
 * @param {number} idSystem - The ID of the system.
 * @returns {Promise<object>} - A promise that resolves to an object containing the following properties:
 *   - message: A string indicating the result of the operation.
 *   - idRequest: The ID of the created request (if successful).
 * @throws {Error} - If an error occurs during the operation.
 */
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
    return "Request created sucessfully";
  } catch (error) {
    throw new Error(`Error creating request: ${error.message}`);
  }
}

/**
 * Retrieves requests for a specific client.
 * @param {number} idClient - The ID of the client.
 * @returns {Promise<object[]>} - A promise that resolves to an array of objects representing the requests.
 *   Each object contains the following properties:
 *   - id: The ID of the request.
 *   - idSite: The ID of the site.
 *   - siteName: The name of the site.
 *   - code: The code of the request.
 *   - idSystem: The ID of the system.
 *   - systemName: The name of the system.
 *   - idType: The ID of the request type.
 *   - requestTypeName: The name of the request type.
 *   - scope: The scope of the request.
 *   - idStatus: The ID of the request status.
 *   - statusName: The name of the request status.
 *   - idCreatedBy: The ID of the user who created the request.
 *   - createdByUsername: The username of the user who created the request.
 *   - createdAt: The date and time when the request was created.
 * @throws {Error} - If an error occurs during the operation.
 */
async function getRequestsPerClient(idClient) {
  try {
    const result = await executeSp("sp_GetRequestsPerClient", [
      { name: "idClient", value: idClient, type: sql.Int },
    ]);
    return result;
  } catch (error) {
    throw new Error(`Error retrieving requests per client: ${error.message}`);
  }
}

/**
 * Retrieves requests for a specific site.
 * @param {number} idSite - The ID of the site.
 * @returns {Promise<object[]>} - A promise that resolves to an array of objects representing the requests.
 *   Each object contains the same properties as described in the getRequestPerClient function.
 * @throws {Error} - If an error occurs during the operation.
 */
async function getRequestPerSite(idSite) {
  try {
    const result = await executeSp("sp_GetRequestPerSite", [
      { name: "idSite", value: idSite, type: sql.Int },
    ]);
    return result;
  } catch (error) {
    throw new Error(`Error retrieving requests per site: ${error.message}`);
  }
}

/**
 * Retrieves a request by its ID.
 * @param {number} idRequest - The ID of the request.
 * @returns {Promise<object>} - A promise that resolves to an object representing the request.
 *   The object contains the following properties:
 *   - id: The ID of the request.
 *   - idSite: The ID of the site.
 *   - siteName: The name of the site.
 *   - code: The code of the request.
 *   - idSystem: The ID of the system.
 *   - systemName: The name of the system.
 *   - idRequestType: The ID of the request type.
 *   - requestTypeName: The name of the request type.
 *   - scope: The scope of the request.
 *   - idStatus: The ID of the request status.
 *   - statusName: The name of the request status.
 *   - idCreatedBy: The ID of the user who created the request.
 *   - createdByUsername: The username of the user who created the request.
 *   - createdAt: The date and time when the request was created.
 *   - idTechnicianAssigned: The ID of the technician assigned to the request.
 *   - technicianUsername: The username of the technician assigned to the request.
 *   - technicianFullName: The full name of the technician assigned to the request.
 *   - technicianAssignedDatetime: The date and time when the technician was assigned to the request.
 *   - technicianAcknowledgeDatetime: The date and time when the technician acknowledged the request.
 *   - technicianStartingWorkDatetime: The date and time when the technician started working on the request.
 * @throws {Error} - If an error occurs during the operation.
 */
async function getRequestById(idRequest) {
  try {
    const result = await executeSp("sp_GetRequestById", [
      { name: "idRequest", value: idRequest, type: sql.BigInt },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(`Error retrieving request by ID: ${error.message}`);
  }
}

/**
 * Deletes a request by its ID.
 * @param {number} idRequest - The ID of the request.
 * @returns {Promise<object>} - A promise that resolves to an object containing the following properties:
 *   - message: A string indicating the result of the operation.
 * @throws {Error} - If an error occurs during the operation.
 */
async function deleteRequest(idRequest) {
  try {
    const result = await executeSp("sp_DeleteRequest", [
      { name: "id", value: idRequest, type: sql.BigInt },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(`Error deleting request: ${error.message}`);
  }
}

/**
 * Retrieves requests assigned to a specific technician.
 * @param {number} idTechnician - The ID of the technician.
 * @returns {Promise<object[]>} - A promise that resolves to an array of objects representing the requests.
 *   Each object contains the same properties as described in the getRequestPerClient function.
 * @throws {Error} - If an error occurs during the operation.
 */
async function getRequestsByAssignedTechnician(idTechnician) {
  try {
    const result = await executeSp("sp_GetRequestsByAssignedTechnician", [
      { name: "idTechnician", value: idTechnician, type: sql.Int },
    ]);
    return result;
  } catch (error) {
    throw new Error(
      `Error retrieving requests by assigned technician: ${error.message}`
    );
  }
}

/**
 * Retrieves all requests.
 * @returns {Promise<object[]>} - A promise that resolves to an array of objects representing the requests.
 *   Each object contains the same properties as described in the getRequestPerClient function.
 * @throws {Error} - If an error occurs during the operation.
 */
async function getRequests() {
  try {
    const result = await executeSp("sp_GetRequests");
    return result;
  } catch (error) {
    throw new Error(`Error retrieving requests: ${error.message}`);
  }
}

/**
 * Updates a request.
 * @param {number} id - The ID of the request.
 * @param {number} idSite - The ID of the site.
 * @param {string} code - The code of the request.
 * @param {number} type - The type of the request.
 * @param {string} scope - The scope of the request.
 * @param {number} idSystem - The ID of the system.
 * @returns {Promise<object>} - A promise that resolves to an object containing the following properties:
 *   - message: A string indicating the result of the operation.
 * @throws {Error} - If an error occurs during the operation.
 */
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
    return "Request updated sucessfully";
  } catch (error) {
    throw new Error(`Error updating request: ${error.message}`);
  }
}

/**
 * Assigns a technician to a request.
 * @param {number} idRequest - The ID of the request.
 * @param {number} idTechnician - The ID of the technician.
 * @returns {Promise<object>} - A promise that resolves to an object containing the following properties:
 *   - message: A string indicating the result of the operation.
 *   - idRequest: The ID of the request.
 * @throws {Error} - If an error occurs during the operation.
 */
async function assignTechnicianToRequest(idRequest, idTechnician) {
  try {
    const result = await executeSp("sp_AssignTechnicianToRequest", [
      { name: "idRequest", value: idRequest, type: sql.BigInt },
      { name: "idTechnician", value: idTechnician, type: sql.Int },
    ]);
    return "Technician assigned sucessfully";
  } catch (error) {
    throw new Error(`Error assigning technician to request: ${error.message}`);
  }
}

/**
 * Acknowledges a request by a technician.
 * @param {number} idRequest - The ID of the request.
 * @param {number} idTechnician - The ID of the technician.
 * @returns {Promise<object>} - A promise that resolves to an object containing the following properties:
 *   - message: A string indicating the result of the operation.
 * @throws {Error} - If an error occurs during the operation.
 */
async function acknowledgeRequestByTechnician(idRequest, idTechnician) {
  try {
    const result = await executeSp("sp_AcknowledgeRequestByTechnician", [
      { name: "idRequest", value: idRequest, type: sql.BigInt },
      { name: "roleidTechnicianId", value: idTechnician, type: sql.Int },
    ]);
    return "Technician acknowleged sucessfully";
  } catch (error) {
    throw new Error(
      `Error acknowledging request by technician: ${error.message}`
    );
  }
}

/**
 * Starts a request by a technician.
 * @param {number} idRequest - The ID of the request.
 * @param {number} idTechnician - The ID of the technician.
 * @returns {Promise<object>} - A promise that resolves to an object containing the following properties:
 *   - message: A string indicating the result of the operation.
 * @throws {Error} - If an error occurs during the operation.
 */
async function startRequestByTechnician(idRequest, idTechnician) {
  try {
    const result = await executeSp("sp_StartRequestByTechnician", [
      { name: "idRequest", value: idRequest, type: sql.BigInt },
      { name: "roleidTechnicianId", value: idTechnician, type: sql.Int },
    ]);
    return "Techncian started request sucessfully";
  } catch (error) {
    throw new Error(`Error starting request by technician: ${error.message}`);
  }
}

/**
 * Get the requests types.
 * @returns {Promise<object[]>} - A promise that resolves to an array of objects representing the requests types.
 *   Each object contains the following properties:
 *   - id: The ID of the request type.
 *   - name: The name of the request type.
 * @throws {Error} - If an error occurs during the operation.
 */
async function getRequestTypes() {
  try {
    const result = await executeSp("sp_GetRequestTypes");
    return result;
  } catch (error) {
    throw new Error(`Error getting request types: ${error.message}`);
  }
}

/**
 * Get the requests types.
 * @returns {Promise<object[]>} - A promise that resolves to an array of objects representing the requests status.
 *   Each object contains the following properties:
 *   - id: The ID of the request type.
 *   - name: The name of the request type.
 * @throws {Error} - If an error occurs during the operation.
 */
async function getRequestStatus() {
  try {
    const result = await executeSp("sp_GetRequestStatuses");
    return result;
  } catch (error) {
    throw new Error(`Error getting request statuses: ${error.message}`);
  }
}

module.exports = {
  create: createRequest,
  getByClient: getRequestsPerClient,
  getBySite: getRequestPerSite,
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
};
