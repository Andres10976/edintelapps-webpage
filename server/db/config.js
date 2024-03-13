require('dotenv').config();

module.exports = {
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  driver: 'msnodesqlv8',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    trustServerCertificate: true
  }
};