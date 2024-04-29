const sql = require('mssql');
const { executeSp } = require('../db');

/**
 * Creates a new client.
 * @param {string} name - The name of the client.
 * @param {string} phone - The phone number of the client.
 * @param {string} email - The email address of the client.
 * @param {string} contactName - The name of the contact person.
 * @param {string} contactLastName - The last name of the contact person.
 * @param {string} contactPhone - The phone number of the contact person.
 * @param {string} contactEmail - The email address of the contact person.
 * @returns {Promise<Object>} A promise that resolves to an object containing the following properties:
 *   - clientId: The ID of the created client.
 *   - message: A success message indicating that the client was created successfully.
 * @throws {Error} If the client creation is unsuccessful.
 */
async function createClient(name, phone, email, contactName, contactLastName, contactPhone, contactEmail) {
  try {
    const result = await executeSp('sp_CreateClient', [
      { name: 'name', value: name, type: sql.VarChar(50) },
      { name: 'phone', value: phone, type: sql.VarChar(20) },
      { name: 'email', value: email, type: sql.VarChar(255) },
      { name: 'contactName', value: contactName, type: sql.VarChar(50) },
      { name: 'contactLastName', value: contactLastName, type: sql.VarChar(50) },
      { name: 'contactPhone', value: contactPhone, type: sql.VarChar(20) },
      { name: 'contactEmail', value: contactEmail, type: sql.VarChar(255) }
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Retrieves a list of active clients.
 * @returns {Promise<Array>} A promise that resolves to an array of client objects with the following properties:
 *   - id: The ID of the client.
 *   - name: The name of the client.
 *   - phone: The phone number of the client.
 *   - email: The email address of the client.
 *   - contactName: The name of the contact person.
 *   - contactLastname: The last name of the contact person.
 *   - contactEmail: The email address of the contact person.
 *   - contactPhone: The phone number of the contact person.
 *   - createdAt: The timestamp of when the client was created.
 */
async function getClients() {
  const result = await executeSp('sp_GetClients');
  return result;
}

/**
 * Retrieves a client by their ID.
 * @param {number} clientId - The ID of the client to retrieve.
 * @returns {Promise<Object>} A promise that resolves to an object containing the client details with the following properties:
 *   - id: The ID of the client.
 *   - name: The name of the client.
 *   - phone: The phone number of the client.
 *   - email: The email address of the client.
 *   - contactName: The name of the contact person.
 *   - contactLastname: The last name of the contact person.
 *   - contactEmail: The email address of the contact person.
 *   - contactPhone: The phone number of the contact person.
 *   - createdAt: The timestamp of when the client was created.
 */
async function getClientById(clientId) {
  const result = await executeSp('sp_GetClientById', [
    { name: 'clientId', value: clientId, type: sql.Int }
  ]);
  return result.at(0);
}

/**
 * Delete a client by their ID.
 * @param {number} clientId - The ID of the client to delete.
 * @returns {Promise<string>} A promise that resolves to a success message indicating that the client was deleted successfully.
 * @throws {Error} If the client deletion is unsuccessful.
 */
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

/**
 * Updates an existing client.
 * @param {number} clientId - The ID of the client to update.
 * @param {string} name - The updated name of the client.
 * @param {string} phone - The updated phone number of the client.
 * @param {string} email - The updated email address of the client.
 * @param {string} contactName - The updated name of the contact person.
 * @param {string} contactLastName - The updated last name of the contact person.
 * @param {string} contactPhone - The updated phone number of the contact person.
 * @param {string} contactEmail - The updated email address of the contact person.
 * @returns {Promise<string>} A promise that resolves to a success message indicating that the client was updated successfully.
 * @throws {Error} If the client update is unsuccessful.
 */
async function updateClient(clientId, name, phone, email, contactName, contactLastName, contactPhone, contactEmail) {
  try {
    const result = await executeSp('sp_UpdateClient', [
      { name: 'clientId', value: clientId, type: sql.Int },
      { name: 'name', value: name, type: sql.VarChar(50) },
      { name: 'phone', value: phone, type: sql.VarChar(20) },
      { name: 'email', value: email, type: sql.VarChar(255) },
      { name: 'contactName', value: contactName, type: sql.VarChar(50) },
      { name: 'contactLastName', value: contactLastName, type: sql.VarChar(50) },
      { name: 'contactPhone', value: contactPhone, type: sql.VarChar(20) },
      { name: 'contactEmail', value: contactEmail, type: sql.VarChar(255) }
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
  update: updateClient,
  delete: deleteClient
};