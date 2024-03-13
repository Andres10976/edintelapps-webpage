const sql = require('mssql');
const { executeSp } = require('../db');

async function createUser(username, passwordHash, salt, email, name, lastname, roleId, phone = '') {
  return await executeSp('sp_CreateUser', [
    { name: 'username', value: username, type: sql.VarChar(50) },
    { name: 'passwordHash', value: passwordHash, type: sql.VarChar(255) },
    { name: 'salt', value: salt, type: sql.NVarChar(100) },
    { name: 'email', value: email, type: sql.VarChar(255) },
    { name: 'name', value: name, type: sql.VarChar(50) },
    { name: 'lastname', value: lastname, type: sql.VarChar(50) },
    { name: 'roleId', value: roleId, type: sql.SmallInt },
    { name: 'phone', value: phone, type: sql.VarChar(20) }
  ]);
}

async function getUsers() {
  return await executeSp('sp_GetUsers');
}

async function getUserById(userId) {
  return await executeSp('sp_GetUserById', [
    { name: 'userId', value: userId, type: sql.Int }
  ]);
}

async function getUserByUsername(username) {
  return await executeSp('sp_GetUserByUsername', [
    { name: 'username', value: username, type: sql.VarChar(50) }
  ]);
}

async function getUserByEmail(email) {
  return await executeSp('sp_GetUserByEmail', [
    { name: 'email', value: email, type: sql.VarChar(255) }
  ]);
}

async function getUserByResetToken(token) {
  return await executeSp('sp_GetUserByResetToken', [
    { name: 'token', value: token, type: sql.VarChar(100) }
  ]);
}


async function updateUser(id, username, email, name, lastname, roleId, phone, isActive) {
  return await executeSp('sp_UpdateUser', [
    { name: 'id', value: id, type: sql.Int },
    { name: 'username', value: username, type: sql.VarChar(50) },
    { name: 'email', value: email, type: sql.VarChar(255) },
    { name: 'name', value: name, type: sql.VarChar(50) },
    { name: 'lastname', value: lastname, type: sql.VarChar(50) },
    { name: 'roleId', value: roleId, type: sql.SmallInt },
    { name: 'phone', value: phone, type: sql.VarChar(20) },
    { name: 'isActive', value: isActive, type: sql.Bit }
  ]);
}

async function deactivateUser(userId) {
  return await executeSp('sp_DeactivateUser', [
    { name: 'userId', value: userId, type: sql.Int }
  ]);
}

async function reactivateUser(userId) {
  return await executeSp('sp_ReactivateUser', [
    { name: 'userId', value: userId, type: sql.Int }
  ]);
}

async function updateUserRole(userId, roleId) {
  return await executeSp('sp_UpdateUserRole', [
    { name: 'userId', value: userId, type: sql.Int },
    { name: 'roleId', value: roleId, type: sql.SmallInt }
  ]);
}

async function resetPasswordByUserId(id, newPasswordHash, salt) {
  return await executeSp('sp_ResetPasswordById', [
    { name: 'id', value: id, type: sql.Int },
    { name: 'newPasswordHash', value: newPasswordHash, type: sql.NVarChar(255) },
    { name: 'salt', value: salt, type: sql.NVarChar(100) }
  ]);
}

async function savePasswordResetToken(id, resetToken, resetTokenExpires) {
  return await executeSp('sp_SavePasswordResetToken', [
    { name: 'id', value: id, type: sql.Int },
    { name: 'resetToken', value: resetToken, type: sql.VarChar(100) },
    { name: 'resetTokenExpires', value: resetTokenExpires, type: sql.DateTime }
  ]);
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
};