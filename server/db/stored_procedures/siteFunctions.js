const sql = require("mssql");
const { executeSp } = require("../db");

async function createSite(idClient, name, supervisor, contactName = null, contactPhone = null, contactMail = null, address = null) {
  try {
    const result = await executeSp("sp_CreateSite", [
      { name: "idClient", value: idClient, type: sql.Int },
      { name: "name", value: name, type: sql.VarChar(50) },
      { name: "supervisor", value: supervisor, type: sql.Int },
      { name: "contactName", value: contactName, type: sql.VarChar(255) },
      { name: "contactPhone", value: contactPhone, type: sql.VarChar(20) },
      { name: "contactMail", value: contactMail, type: sql.VarChar(255) },
      { name: "address", value: address, type: sql.VarChar(sql.MAX) },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getSites() {
  const sites = await executeSp("sp_GetSites");
  return sites;
}

async function getSiteById(id) {
  const site = await executeSp("sp_GetSiteById", [
    { name: "id", value: id, type: sql.Int },
  ]);
  return site;
}

async function getSitesPerClient(idClient) {
  const sites = await executeSp("sp_GetSitesPerClient", [
    { name: "idClient", value: idClient, type: sql.Int },
  ]);
  return sites;
}

async function getSitesPerClientUser(idUser) {
  const sites = await executeSp("sp_GetSitesPerClientUser", [
    { name: "idUser", value: idUser, type: sql.Int },
  ]);
  return sites;
}

async function getSitesByCompany(idCompany) {
  const sites = await executeSp("sp_GetSitesByCompany", [
    { name: "idCompany", value: idCompany, type: sql.Int },
  ]);
  return sites;
}

async function updateSite(id, name, supervisor, idClient, contactName = null, contactMail = null, contactPhone = null, address = null) {
  try {
    const result = await executeSp("sp_UpdateSite", [
      { name: "id", value: id, type: sql.Int },
      { name: "name", value: name, type: sql.VarChar(50) },
      { name: "supervisor", value: supervisor, type: sql.Int },
      { name: "idClient", value: idClient, type: sql.Int },
      { name: "contactName", value: contactName, type: sql.VarChar(255) },
      { name: "contactMail", value: contactMail, type: sql.VarChar(255) },
      { name: "contactPhone", value: contactPhone, type: sql.VarChar(20) },
      { name: "address", value: address, type: sql.VarChar(sql.MAX) },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function deleteSite(id) {
  try {
    const result = await executeSp("sp_DeleteSite", [
      { name: "id", value: id, type: sql.Int },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function assignSystemToSite(idSite, idSystem) {
  try {
    const result = await executeSp("sp_AssignSystemToSite", [
      { name: "idSite", value: idSite, type: sql.Int },
      { name: "idSystem", value: idSystem, type: sql.SmallInt },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function dissociateSiteToSystem(idSite, idSystem) {
  try {
    const result = await executeSp("sp_DissociateSiteToSystem", [
      { name: "idSite", value: idSite, type: sql.Int },
      { name: "idSystem", value: idSystem, type: sql.SmallInt },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  create: createSite,
  getAll: getSites,
  getById: getSiteById,
  getByClient: getSitesPerClient,
  getbyCompany: getSitesByCompany,
  update: updateSite,
  delete: deleteSite,
  assignSystem: assignSystemToSite,
  dissociateSystem: dissociateSiteToSystem,
  getByClientUser: getSitesPerClientUser
};