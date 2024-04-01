const sql = require("mssql");
const { executeSp } = require("../db");

/**
 * Creates a new system.
 * @param {string} name - The name of the system.
 * @returns {Promise<Object>} - A promise that resolves to an object with the following properties:
 *   - status: A string indicating the status of the operation ('System created successfully.' if successful).
 *   - error: An error object if the operation was unsuccessful.
 */
async function createSystem(name) {
  try {
    const result = await executeSp("sp_CreateSystem", [
      { name: "name", value: name, type: sql.VarChar(255) },
    ]);
    return "System creted sucessfully";
  } catch (error) {
    throw new Error(`System creted unsucessfully: ${error.message}`);
  }
}

/**
 * Retrieves a list of active systems.
 * @returns {Promise<Object>} - A promise that resolves to an object with the following properties:
 *   - systems: An array of system objects, each containing the following properties:
 *     - id: The ID of the system.
 *     - name: The name of the system.
 *   - error: An error object if the operation was unsuccessful.
 */
async function getSystems() {
  try {
    const result = await executeSp("sp_GetSystems");
    return result;
  } catch (error) {
    throw new Error(`Get systems error: ${error.message}`);
  }
}

/**
 * Updates an existing system.
 * @param {number} id - The ID of the system to update.
 * @param {string} name - The updated name of the system.
 * @param {boolean} [isActive=true] - The updated active status of the system.
 * @returns {Promise<Object>} - A promise that resolves to an object with the following properties:
 *   - status: A string indicating the status of the operation ('System created successfully.' if successful).
 *   - error: An error object if the operation was unsuccessful.
 */
async function updateSystem(id, name, isActive = true) {
  try {
    const result = await executeSp("sp_UpdateSystem", [
      { name: "id", value: id, type: sql.SmallInt },
      { name: "name", value: name, type: sql.VarChar(255) },
      { name: "isActive", value: isActive, type: sql.Bit },
    ]);
    return `System updated sucessfully`;
  } catch (error) {
    throw new Error(`System updated unsucessfully: ${error.message}`);
  }
}

/**
 * Deletes logically an existing system.
 * @param {number} id - The ID of the system to delete.
 * @returns {Promise<Object>} - A promise that resolves to an object with the following properties:
 *   - status: A string indicating the status of the operation ('System deleted successfully.' if successful).
 *   - error: An error object if the operation was unsuccessful.
 */
async function deleteSystem(id) {
  try {
    const result = await executeSp("sp_DeleteSystem", [
      { name: "id", value: id, type: sql.SmallInt },
    ]);
    return `System deleted sucessfully`;
  } catch (error) {
    throw new Error(`System deleted unsucessfully: ${error.message}`);
  }
}

/**
 * Retrieves a list of system types associated with a specific site.
 * @param {number} idSite - The ID of the site.
 * @returns {Promise<Object>} - A promise that resolves to an object with the following properties:
 *   - systemTypes: An array of system type objects, each containing the following properties:
 *     - idSystem: The ID of the associated system.
 *     - SystemName: The name of the associated system.
 *     - idSystemType: The ID of the system type.
 *     - SystemTypeName: The name of the system type.
 *   - error: An error object if the operation was unsuccessful.
 */
async function getSystemPerSite(idSite) {
  try {
    const result = await executeSp("sp_GetSystemPerSite", [
      { name: "idSite", value: idSite, type: sql.Int },
    ]);
    return result;
  } catch (error) {
    throw new Error(`Get systems per site error: ${error.message}`);
  }
}

module.exports = {
  createSystem,
  getSystems,
  updateSystem,
  deleteSystem,
  getSystemPerSite,
};
