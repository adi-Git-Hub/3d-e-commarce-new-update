const { Pool } = require("pg");

const pool = new Pool({
  user: "mac",
  host: "localhost",
  database: "ecommerce",  // ✅ correct
  password: "",           // agar password nahi hai toh empty
  port: 5432,
});

module.exports = pool;
