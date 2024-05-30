const sql = require("mssql");
const { executeSp } = require("../db");

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
  companyId = null
) {
  try {
    const result = await executeSp("sp_CreateUser", [
      { name: "username", value: username, type: sql.VarChar(50) },
      { name: "passwordHash", value: passwordHash, type: sql.VarChar(255) },
      { name: "salt", value: salt, type: sql.NVarChar(100) },
      { name: "email", value: email, type: sql.VarChar(255) },
      { name: "name", value: name, type: sql.VarChar(50) },
      { name: "lastname", value: lastname, type: sql.VarChar(50) },
      { name: "roleId", value: roleId, type: sql.SmallInt },
      { name: "phone", value: phone, type: sql.VarChar(20) },
      { name: "clientId", value: clientId, type: sql.Int },
      { name: "companyId", value: companyId, type: sql.Int },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}


async function getUsers() {
  try {
    const result = await executeSp("sp_GetUsers");
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}


async function getTechnicians() {
  try {
    const result = await executeSp("sp_GetTechnicians");
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}


async function getSupervisors() {
  try {
    const result = await executeSp("sp_GetSupervisors");
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getOperators() {
  try {
    const result = await executeSp("sp_GetOperators");
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}


async function getClients() {
  try {
    const result = await executeSp("sp_GetClientUsers");
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}


async function getUserRoles() {
  try {
    const result = await executeSp("sp_GetRoles");
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}

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

async function updateUser(id, username, email, name, lastname, roleId, phone=null, clientId=null, companyId=null) {
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
      { name: "companyId", value: companyId, type: sql.Int },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}


async function deactivateUser(userId) {
  try {
    const result = await executeSp("sp_DeactivateUser", [
      { name: "userId", value: userId, type: sql.Int },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}


async function reactivateUser(userId) {
  try {
    const result = await executeSp("sp_ReactivateUser", [
      { name: "userId", value: userId, type: sql.Int },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}


async function updateUserRole(userId, roleId) {
  try {
    const result = await executeSp("sp_UpdateUserRole", [
      { name: "userId", value: userId, type: sql.Int },
      { name: "roleId", value: roleId, type: sql.SmallInt },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

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

async function assignSiteToUser(idSite, idUser) {
  try {
    const result = await executeSp("sp_AssignSiteToUser", [
      { name: "idSite", value: idSite, type: sql.Int },
      { name: "idUser", value: idUser, type: sql.Int },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function dissasociateSiteToUser(idSite, idUser) {
  try {
    const result = await executeSp("sp_DissociateSiteToUser", [
      { name: "idSite", value: idSite, type: sql.Int },
      { name: "idUser", value: idUser, type: sql.Int },
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
  getTechnicians,
  getSupervisors,
  getOperators,
  getClients,
  disassignSite: dissasociateSiteToUser,
  assignSite: assignSiteToUser 
};
