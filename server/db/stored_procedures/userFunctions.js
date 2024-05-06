const sql = require("mssql");
const { executeSp } = require("../db");

/**
 * Creates a new user.
 * @param {string} username - The username of the user.
 * @param {string} passwordHash - The hashed password of the user.
 * @param {string} salt - The salt used for password hashing.
 * @param {string} email - The email address of the user.
 * @param {string} name - The first name of the user.
 * @param {string} lastname - The last name of the user.
 * @param {number} roleId - The role ID of the user.
 * @param {string} [phone=''] - The phone number of the user (optional).
 * @returns {Promise<void>} - A promise that resolves when the user is created successfully.
 * @throws {Error} - Throws an error if the user creation fails.
 */
async function createUser(
  username,
  passwordHash,
  salt,
  email,
  name,
  lastname,
  roleId,
  phone = null,
  clientId = null,
  siteId = null
) {
  try {
    await executeSp("sp_CreateUser", [
      { name: "username", value: username, type: sql.VarChar(50) },
      { name: "passwordHash", value: passwordHash, type: sql.VarChar(255) },
      { name: "salt", value: salt, type: sql.NVarChar(100) },
      { name: "email", value: email, type: sql.VarChar(255) },
      { name: "name", value: name, type: sql.VarChar(50) },
      { name: "lastname", value: lastname, type: sql.VarChar(50) },
      { name: "roleId", value: roleId, type: sql.SmallInt },
      { name: "phone", value: phone, type: sql.VarChar(20) },
      { name: "clientId", value: clientId, type: sql.Int },
      { name: "siteId", value: siteId, type: sql.Int },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Retrieves a list of users.
 * @returns {Promise<Array>} - A promise that resolves to an array of user objects.
 * @throws {Error} - Throws an error if the user retrieval fails.
 */
async function getUsers() {
  try {
    const result = await executeSp("sp_GetUsers");
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Retrieves a list of user roles with its id and name.
 * @returns {Promise<Array>} - A promise that resolves to an array of user objects.
 * @throws {Error} - Throws an error if the user retrieval fails.
 */
async function getUserRoles() {
  try {
    const result = await executeSp("sp_GetRoles");
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Retrieves a user by their ID.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Object>} - A promise that resolves to a user object with the following properties:
 *   - id (number): The ID of the user.
 *   - email (string): The email address of the user.
 *   - phone (string): The phone number of the user.
 *   - username (string): The username of the user.
 *   - roleId (number): The role ID of the user.
 *   - rolename (string): The name of the user's role.
 *   - name (string): The first name of the user.
 *   - lastname (string): The last name of the user.
 *   - isActive (boolean): Indicates whether the user is active.
 *   - passwordHash (string): The hashed password of the user.
 *   - salt (string): The salt used for password hashing.
 *   - createdAt (Date): The date and time when the user was created.
 * @throws {Error} - Throws an error if the user retrieval fails.
 */
async function getUserById(userId) {
  try {
    const result = await executeSp("sp_GetUserById", [
      { name: "userId", value: userId, type: sql.Int },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Retrieves a user by their username.
 * @param {string} username - The username of the user.
 * @returns {Promise<Object>} - A promise that resolves to a user object with the following properties:
 *   - id (number): The ID of the user.
 *   - email (string): The email address of the user.
 *   - username (string): The username of the user.
 *   - phone (string): The phone number of the user.
 *   - roleId (number): The role ID of the user.
 *   - roleName (string): The name of the user's role.
 *   - name (string): The first name of the user.
 *   - lastname (string): The last name of the user.
 *   - passwordHash (string): The hashed password of the user.
 *   - salt (string): The salt used for password hashing.
 *   - isActive (boolean): Indicates whether the user is active.
 *   - createdAt (Date): The date and time when the user was created.
 * @throws {Error} - Throws an error if the user retrieval fails.
 */
async function getUserByUsername(username) {
  try {
    const result = await executeSp("sp_GetUserByUsername", [
      { name: "username", value: username, type: sql.VarChar(50) },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Retrieves a user by their email address.
 * @param {string} email - The email address of the user.
 * @returns {Promise<Object>} - A promise that resolves to a user object with the following properties:
 *   - id (number): The ID of the user.
 *   - email (string): The email address of the user.
 *   - username (string): The username of the user.
 *   - phone (string): The phone number of the user.
 *   - roleId (number): The role ID of the user.
 *   - roleName (string): The name of the user's role.
 *   - name (string): The first name of the user.
 *   - lastname (string): The last name of the user.
 *   - passwordHash (string): The hashed password of the user.
 *   - salt (string): The salt used for password hashing.
 *   - isActive (boolean): Indicates whether the user is active.
 *   - createdAt (Date): The date and time when the user was created.
 * @throws {Error} - Throws an error if the user retrieval fails.
 */
async function getUserByEmail(email) {
  try {
    const result = await executeSp("sp_GetUserByEmail", [
      { name: "email", value: email, type: sql.VarChar(255) },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Retrieves a user by their password reset token.
 * @param {string} token - The password reset token.
 * @returns {Promise<Object>} - A promise that resolves to a user object with the following properties:
 *   - id (number): The ID of the user.
 *   - email (string): The email address of the user.
 *   - phone (string): The phone number of the user.
 *   - roleId (number): The role ID of the user.
 *   - roleName (string): The name of the user's role.
 *   - name (string): The first name of the user.
 *   - lastname (string): The last name of the user.
 *   - passwordHash (string): The hashed password of the user.
 *   - salt (string): The salt used for password hashing.
 *   - isActive (boolean): Indicates whether the user is active.
 *   - createdAt (Date): The date and time when the user was created.
 * @throws {Error} - Throws an error if the user retrieval fails.
 */
async function getUserByResetToken(token) {
  try {
    const result = await executeSp("sp_GetUserByResetToken", [
      { name: "token", value: token, type: sql.VarChar(100) },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Updates a user's information.
 * @param {number} id - The ID of the user.
 * @param {string} username - The updated username of the user.
 * @param {string} email - The updated email address of the user.
 * @param {string} name - The updated first name of the user.
 * @param {string} lastname - The updated last name of the user.
 * @param {number} roleId - The updated role ID of the user.
 * @param {string} phone - The updated phone number of the user.
 * @param {number} clientId - If the created user is a client role, this must be entered.
 * @param {number} siteId - If the created user is a client role, this must be entered.
 * @returns {Promise<void>} - A promise that resolves when the user is updated successfully.
 * @throws {Error} - Throws an error if the user update fails.
 */
async function updateUser(id, username, email, name, lastname, roleId, phone=null, clientId=null, siteId=null) {
  try {
    const result = await executeSp("sp_UpdateUser", [
      { name: "id", value: id, type: sql.Int },
      { name: "username", value: username, type: sql.VarChar(50) },
      { name: "email", value: email, type: sql.VarChar(255) },
      { name: "name", value: name, type: sql.VarChar(50) },
      { name: "lastname", value: lastname, type: sql.VarChar(50) },
      { name: "phone", value: phone, type: sql.VarChar(20) },
      { name: "roleId", value: roleId, type: sql.SmallInt },
      { name: "clientId", value: clientId, type: sql.Int },
      { name: "siteId", value: siteId, type: sql.Int },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Deactivates a user.
 * @param {number} userId - The ID of the user to deactivate.
 * @returns {Promise<void>} - A promise that resolves when the user is deactivated successfully.
 * @throws {Error} - Throws an error if the user deactivation fails.
 */
async function deactivateUser(userId) {
  try {
    await executeSp("sp_DeactivateUser", [
      { name: "userId", value: userId, type: sql.Int },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Reactivates a user.
 * @param {number} userId - The ID of the user to reactivate.
 * @returns {Promise<void>} - A promise that resolves when the user is reactivated successfully.
 * @throws {Error} - Throws an error if the user reactivation fails.
 */
async function reactivateUser(userId) {
  try {
    await executeSp("sp_ReactivateUser", [
      { name: "userId", value: userId, type: sql.Int },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Updates a user's role.
 * @param {number} userId - The ID of the user.
 * @param {number} roleId - The new role ID for the user.
 * @returns {Promise<void>} - A promise that resolves when the user's role is updated successfully.
 * @throws {Error} - Throws an error if the role update fails.
 */
async function updateUserRole(userId, roleId) {
  try {
    await executeSp("sp_UpdateUserRole", [
      { name: "userId", value: userId, type: sql.Int },
      { name: "roleId", value: roleId, type: sql.SmallInt },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Resets a user's password.
 * @param {number} id - The ID of the user.
 * @param {string} newPasswordHash - The new hashed password.
 * @param {string} salt - The salt used for password hashing.
 * @returns {Promise<void>} - A promise that resolves when the password is reset successfully.
 * @throws {Error} - Throws an error if the password reset fails.
 */
async function resetPasswordByUserId(id, newPasswordHash, salt) {
  try {
    const result = await executeSp("sp_ResetPasswordById", [
      { name: "id", value: id, type: sql.Int },
      {
        name: "newPasswordHash",
        value: newPasswordHash,
        type: sql.NVarChar(255),
      },
      { name: "salt", value: salt, type: sql.NVarChar(100) },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Saves a password reset token for a user.
 * @param {number} id - The ID of the user.
 * @param {string} resetToken - The password reset token.
 * @param {Date} resetTokenExpires - The expiration date and time of the reset token.
 * @returns {Promise<void>} - A promise that resolves when the reset token is saved successfully.
 * @throws {Error} - Throws an error if saving the reset token fails.
 */
async function savePasswordResetToken(id, resetToken, resetTokenExpires) {
  try {
    const result = await executeSp("sp_SavePasswordResetToken", [
      { name: "id", value: id, type: sql.Int },
      { name: "token", value: resetToken, type: sql.VarChar(100) },
      {
        name: "tokenExpirationDate",
        value: resetTokenExpires,
        type: sql.DateTime,
      },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  create: createUser,
  getAll: getUsers,
  getById: getUserById,
  getByUsername: getUserByUsername,
  getByEmail: getUserByEmail,
  getByResetToken: getUserByResetToken,
  update: updateUser,
  deactivate: deactivateUser,
  reactivate: reactivateUser,
  updateRole: updateUserRole,
  resetPassword: resetPasswordByUserId,
  savePasswordResetToken: savePasswordResetToken,
  roles: getUserRoles,
  
};
