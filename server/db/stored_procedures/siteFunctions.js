const sql = require("mssql");
const { executeSp } = require("../db");

/**
 * Creates a new site.
 * @param {number} idClient - The ID of the client associated with the site.
 * @param {string} name - The name of the site.
 * @param {number} supervisor - The ID of the supervisor for the site.
 * @returns {Promise<string>} A promise that resolves to 'Site created successfully.' if successful, or rejects with an error message if unsuccessful.
 */
async function createSite(idClient, name, supervisor) {
  try {
    const result = await executeSp("sp_CreateSite", [
      { name: "idClient", value: idClient, type: sql.Int },
      { name: "name", value: name, type: sql.VarChar(50) },
      { name: "supervisor", value: supervisor, type: sql.Int },
    ]);
    return "Site created successfully.";
  } catch (error) {
    throw new Error(`Site creation was unsuccessfully: ${error.message}`);
  }
}

/**
 * Retrieves all sites.
 * @returns {Promise<Array>} A promise that resolves to an array of site objects with the following properties:
 *   - id (number): The ID of the site.
 *   - idClient (number): The ID of the client associated with the site.
 *   - ClientName (string): The name of the client associated with the site.
 *   - SupervisorName (string): The name of the supervisor for the site.
 *   - idSystem (number): The ID of the system associated with the site.
 *   - systemName (string): The name of the system associated with the site.
 */
async function getSites() {
  const sites = await executeSp("sp_GetSites");
  return sites;
}

/**
 * Retrieves a site by its ID.
 * @param {number} id - The ID of the site.
 * @returns {Promise<Object>} A promise that resolves to a site object with the following properties:
 *   - id (number): The ID of the site.
 *   - idClient (number): The ID of the client associated with the site.
 *   - ClientName (string): The name of the client associated with the site.
 *   - SupervisorName (string): The name of the supervisor for the site.
 *   - idSystem (number): The ID of the system associated with the site.
 *   - systemName (string): The name of the system associated with the site.
 */
async function getSiteById(id) {
  const site = await executeSp("sp_GetSiteById", [
    { name: "id", value: id, type: sql.Int },
  ]);
  return site.at(0);
}

/**
 * Retrieves sites associated with a specific client.
 * @param {number} idClient - The ID of the client.
 * @returns {Promise<Array>} A promise that resolves to an array of site objects with the following properties:
 *   - id (number): The ID of the site.
 *   - idClient (number): The ID of the client associated with the site.
 *   - ClientName (string): The name of the client associated with the site.
 *   - SupervisorName (string): The name of the supervisor for the site.
 *   - idSystem (number): The ID of the system associated with the site.
 *   - systemName (string): The name of the system associated with the site.
 */
async function getSitesPerClient(idClient) {
  const sites = await executeSp("sp_GetSitesPerClient", [
    { name: "idClient", value: idClient, type: sql.Int },
  ]);
  return sites;
}

/**
 * Updates a site.
 * @param {number} id - The ID of the site to update.
 * @param {string} name - The updated name of the site.
 * @param {number} supervisor - The updated ID of the supervisor for the site.
 * @param {number} idClient - The ID of the client to update.
 * @returns {Promise<string>} A promise that resolves to 'Site updated successfully.' if successful, or rejects with an error message if unsuccessful.
 */
async function updateSite(id, name, supervisor, idClient) {
  try {
    await executeSp("sp_UpdateSite", [
      { name: "id", value: id, type: sql.Int },
      { name: "name", value: name, type: sql.VarChar(50) },
      { name: "supervisor", value: supervisor, type: sql.Int },
      { name: "idClient", value: idClient, type: sql.Int },
    ]);
    return "Site updated successfully.";
  } catch (error) {
    throw new Error(`Site updated unsuccessfully: ${error.message}`);
  }
}

/**
 * Deletes a site.
 * @param {number} id - The ID of the site to delete.
 * @returns {Promise<string>} A promise that resolves to 'Site deleted successfully.' if successful, or rejects with an error message if unsuccessful.
 */
async function deleteSite(id) {
  try {
    await executeSp("sp_DeleteSite", [
      { name: "id", value: id, type: sql.Int },
    ]);
    return "Site deleted successfully.";
  } catch (error) {
    throw new Error(`Site deleted unsuccessfully: ${error.message}`);
  }
}

/**
 * Assigns a system to a site.
 * @param {number} idSite - The ID of the site.
 * @param {number} idSystem - The ID of the system to assign.
 * @returns {Promise<string>} A promise that resolves to 'System assigned successfully.' if successful, or rejects with an error message if unsuccessful.
 */
async function assignSystemToSite(idSite, idSystem) {
  try {
    await executeSp("sp_AssignSystemToSite", [
      { name: "idSite", value: idSite, type: sql.Int },
      { name: "idSystem", value: idSystem, type: sql.SmallInt },
    ]);
    return "System assigned successfully.";
  } catch (error) {
    throw new Error(`System assigned unsuccessfully: ${error.message}`);
  }
}

/**
 * Disassociates a system from a site.
 * @param {number} idSite - The ID of the site.
 * @param {number} idSystem - The ID of the system to disassociate.
 * @returns {Promise<string>} A promise that resolves to 'System disassociated successfully.' if successful, or rejects with an error message if unsuccessful.
 */
async function disassociateSiteToSystem(idSite, idSystem) {
  try {
    await executeSp("sp_DisassociateSiteToSystem", [
      { name: "idSite", value: idSite, type: sql.Int },
      { name: "idSystem", value: idSystem, type: sql.SmallInt },
    ]);
    return "System disassociated successfully.";
  } catch (error) {
    throw new Error(`System disassociated unsuccessfully: ${error.message}`);
  }
}

module.exports = {
  create: createSite,
  getAll: getSites,
  getById: getSiteById,
  getByClient: getSitesPerClient,
  update: updateSite,
  delete: deleteSite,
  assignSystem: assignSystemToSite,
  disassociateSystem: disassociateSiteToSystem,
};
