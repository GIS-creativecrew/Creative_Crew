const pool = require("../config/db");

const createPosting = async ({ title, description, created_by }) => {
  const query = `
    INSERT INTO postings (title, description, created_by)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const result = await pool.query(query, [title, description, created_by]);
  return result.rows[0];
};

const getAllPostings = async () => {
  const query = `SELECT * FROM postings ORDER BY created_at DESC;`;
  const result = await pool.query(query);
  return result.rows;
};

module.exports = { createPosting, getAllPostings };