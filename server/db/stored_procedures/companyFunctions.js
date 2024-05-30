const sql = require('mssql');
const { executeSp } = require('../db');


async function createCompany(name) {
  try {
    const result = await executeSp('sp_CreateCompany', [
      { name: 'name', value: name, type: sql.VarChar(50) },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getCompanies() {
  const result = await executeSp('sp_GetCompanies');
  return result;
}


async function getCompanyById(idCompany) {
  const result = await executeSp('sp_GetCompanyById', [
    { name: 'idCompany', value: idCompany, type: sql.Int }
  ]);
  return result.at(0);
}

async function deleteCompany(idCompany) {
  try {
    const result = await executeSp('sp_DeleteCompany', [
      { name: 'idCompany', value: idCompany, type: sql.Int }
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function updateCompany(idCompany, name) {
  try {
    const result = await executeSp('sp_UpdateCompany', [
      { name: 'name', value: name, type: sql.VarChar(50) },
      { name: 'idCompany', value: idCompany, type: sql.Int },
    ]);
    return result.at(0);
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  create: createCompany,
  getAll: getCompanies,
  get: getCompanyById,
  update: updateCompany,
  delete: deleteCompany
};