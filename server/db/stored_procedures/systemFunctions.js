const sql = require('mssql');
const { executeSp } = require('../db');

/**
 * Creates a new system.
 * @param {string} name - The name of the system.
 * @returns {Promise<Object>} - A promise that resolves to an object with the following properties:
 *   - status: A string indicating the status of the operation ('System created successfully.' if successful).
 *   - error: An error object if the operation was unsuccessful.
 */
async function createSystem(name) {
  try {
    const result = await executeSp('sp_CreateSystem', [
      { name: 'name', value: name, type: sql.VarChar(255) }
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
    const result = await executeSp('sp_GetSystems');
    return result.recordset;
  } catch (error) {
    throw new Error( `Get systems error: ${error.message}`);
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
    const result = await executeSp('sp_UpdateSystem', [
      { name: 'id', value: id, type: sql.SmallInt },
      { name: 'name', value: name, type: sql.VarChar(255) },
      { name: 'isActive', value: isActive, type: sql.Bit }
    ]);
    return `System updated sucessfully`;
  } catch (error) {
    throw new Error( `System updated unsucessfully: ${error.message}`);
  }
}

/**
 * Creates a new system type.
 * @param {string} name - The name of the system type.
 * @param {number} idSystem - The ID of the system associated with the system type.
 * @returns {Promise<Object>} - A promise that resolves to an object with the following properties:
 *   - status: A string indicating the status of the operation.
 *   - error: An error object if the operation was unsuccessful.
 */
async function createSystemType(name, idSystem) {
  try {
    await executeSp('sp_CreateSystemType', [
      { name: 'name', value: name, type: sql.VarChar(255) },
      { name: 'idSystem', value: idSystem, type: sql.SmallInt }
    ]);
    return 'System type created successfully.';
  } catch (error) {
    throw new Error( `System type created unsuccessfully: ${error.message}`);
  }
}

/**
 * Retrieves a list of active system types for a specific system.
 * @param {number} idSystem - The ID of the system.
 * @returns {Promise<Object>} - A promise that resolves to an object with the following properties:
 *   - systemTypes: An array of system type objects, each containing the following properties:
 *     - id: The ID of the system type.
 *     - name: The name of the system type.
 *     - idSystem: The ID of the associated system.
 *     - systemName: The name of the associated system.
 *   - error: An error object if the operation was unsuccessful.
 */
async function getSystemTypesPerSystem(idSystem) {
  try {
    const result = await executeSp('sp_GetSystemTypesPerSystem', [
      { name: 'idSystem', value: idSystem, type: sql.SmallInt },
    ]);
    return result.recordset;
  } catch (error) {
    throw new Error( `Get system types per system error: ${error.message}`);
  }
}

/**
 * Retrieves a list of active system types.
 * @returns {Promise<Object>} - A promise that resolves to an object with the following properties:
 *   - systemTypes: An array of system type objects, each containing the following properties:
 *     - id: The ID of the system type.
 *     - name: The name of the system type.
 *     - idSystem: The ID of the associated system.
 *     - systemName: The name of the associated system.
 *   - error: An error object if the operation was unsuccessful.
 */
async function getSystemTypes() {
  try {
    const result = await executeSp('sp_GetSystemTypes');
    return result.recordset;
  } catch (error) {
    throw new Error( `Get system types error: ${error.message}`);
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
async function getSystemTypesPerSite(idSite) {
  try {
    const result = await executeSp('sp_GetSystemTypesPerSite', [
      { name: 'idSite', value: idSite, type: sql.Int },
    ]);
    return result.recordset;
  } catch (error) {
    throw new Error(`Get syste types per site error: ${error.message}`);
  }
}

/**
 * Retrieves a list of active system types with their associated system names.
 * @returns {Promise<Object>} - A promise that resolves to an object with the following properties:
 *   - systemTypes: An array of system type objects, each containing the following properties:
 *     - idSystem: The ID of the associated system.
 *     - SystemName: The name of the associated system.
 *     - idSystemType: The ID of the system type.
 *     - SystemTypeName: The name of the system type.
 *   - error: An error object if the operation was unsuccessful.
 */
async function getSystemTypesPerSystemWithNames() {
  try {
    const result = await executeSp('sp_GetSystemTypesPerSystemWithNames');
    return result.recordset;
  } catch (error) {
    throw new Error(`Get system types per system with names error: ${error.message}`);
  }
}

/**
 * Updates an existing system type.
 * @param {number} id - The ID of the system type to update.
 * @param {string} name - The updated name of the system type.
 * @param {number} idSystem - The updated ID of the associated system.
 * @param {boolean} isActive - The updated active status of the system type.
 * @returns {Promise<Object>} - A promise that resolves to an object with the following properties:
 *   - status: A string indicating the status of the operation ('System type updated successfully' if successful).
 *   - error: An error object if the operation was unsuccessful.
 */
async function updateSystemType(id, name, idSystem, isActive) {
  try {
    const result = await executeSp('sp_UpdateSystemType', [
      { name: 'id', value: id, type: sql.SmallInt },
      { name: 'name', value: name, type: sql.VarChar(255) },
      { name: 'idSystem', value: idSystem, type: sql.SmallInt },
      { name: 'isActive', value: isActive, type: sql.Bit }
    ]);
    return result.recordset;
  } catch (error) {
    throw new Error(`Update system type error: ${error.message}`);
  }
}

module.exports = {
  createSystem,
  getSystems,
  updateSystem,
  createSystemType,
  getSystemTypes,
  getSystemTypesPerSystemWithNames,
  getSystemTypesPerSystem,
  getSystemTypesPerSite,
  updateSystemType
};