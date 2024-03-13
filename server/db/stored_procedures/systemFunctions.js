const sql = require('mssql');
const { executeSp } = require('../db');

async function createSystem(name) {
  return await executeSp('sp_CreateSystem', [
    { name: 'name', value: name, type: sql.VarChar(255) }
  ]);
}

async function getSystems() {
  return await executeSp('sp_GetSystems');
}

async function updateSystem(id, name, isActive = true) {
  return await executeSp('sp_UpdateSystem', [
    { name: 'id', value: id, type: sql.SmallInt },
    { name: 'name', value: name, type: sql.VarChar(255) },
    { name: 'isActive', value: isActive, type: sql.Bit }
  ]);
}

async function createSystemType(name, idSystem) {
  return await executeSp('sp_CreateSystemType', [
    { name: 'name', value: name, type: sql.VarChar(255) },
    { name: 'idSystem', value: idSystem, type: sql.SmallInt }
  ]);
}

async function getSystemTypesPerSystem(idSystem) {
  return await executeSp('sp_GetSystemTypesPerSystem', [
    { name: 'idSystem', value: idSystem, type: sql.SmallInt },
  ]);
}

async function getSystemTypes() {
  return await executeSp('sp_GetSystemTypes');
}

async function getSystemTypesPerSite(idSite) {
  return await executeSp('sp_GetSystemTypesPerSite', [
    { name: 'idSite', value: idSite, type: sql.Int },
  ]);
}

async function getSystemTypesPerSystemWithNames() {
  return await executeSp('sp_GetSystemTypesPerSystemWithNames');
}

async function updateSystemType(id, name, idSystem, isActive) {
  return await executeSp('sp_UpdateSystemType', [
    { name: 'id', value: id, type: sql.SmallInt },
    { name: 'name', value: name, type: sql.VarChar(255) },
    { name: 'idSystem', value: idSystem, type: sql.SmallInt },
    { name: 'isActive', value: isActive, type: sql.Bit }
  ]);
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