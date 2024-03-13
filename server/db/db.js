const sql = require('mssql');
const config = require('./config');
const { handleError, DatabaseError, isRaisError } = require('./errorHandling');

const pool = new sql.ConnectionPool(config);

async function getConnection() {
  try {
    const connection = await pool.connect();
    return connection;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

async function executeSp(spName, params = []) {
  let retryAttempt = 0;
  const maxRetries = 3;
  while (true) {
    let connection = null;
    try {
      connection = await getConnection();
      const request = new sql.Request(connection);
      params.forEach((param) => request.input(param.name, param.type, param.value));
      const result = await request.execute(spName);
      return result.recordset;
    } catch (error) {
      if (await handleError(error, maxRetries, retryAttempt)) {
        retryAttempt++;
        continue;
      } else {
        if (isRaisError(error)) {
          throw new DatabaseError('Database stored procedure error:', error.message);
        } else {
          throw error;
        }
      }
    } finally {
      if (connection) pool.release(connection);
    }
  }
}

module.exports = {
  executeSp
};