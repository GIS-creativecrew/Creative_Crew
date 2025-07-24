const { Pool } = require("pg");
const dbConfig = require("./db.config");

const pool = new Pool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  port: dbConfig.port,
});

module.exports = pool;
