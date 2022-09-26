const dotenv = require('dotenv');

dotenv.config();

const {
  API_KEY,
  API_URL,
  DATA_URI,
  HOST,
  PORT,
  TOKEN_ADDRESS,
  TOKEN_NAME,
  TOKEN_LOGO_URL,
  TOKEN_DENOMINATION
} = process.env;

const NODE_ENV = 'development';

module.exports = {
  API_KEY,
  API_URL,
  DATA_URI,
  HOST,
  NODE_ENV,
  PORT,
  TOKEN_ADDRESS,
  TOKEN_NAME,
  TOKEN_LOGO_URL,
  TOKEN_DENOMINATION,
  URL: HOST
};
