// index.js
const clientFunctions = require('./stored_procedures/clientFunctions');
const requestFunctions = require('./stored_procedures/requestFunctions');
const siteFunctions = require('./stored_procedures/siteFunctions');
const systemFunctions = require('./stored_procedures/systemFunctions');
const userFunctions = require('./stored_procedures/userFunctions');

module.exports = {
  clientFunctions,
  requestFunctions,
  siteFunctions,
  systemFunctions,
  userFunctions,
};