const pool = require("../config/db");
const generateToken = require("../utils/token");

async function isTokenUnique(token) {
  const res = await pool.query(
    "SELECT 1 FROM candidate_info WHERE candidate_token = $1",
    [token]
  );
  return res.rowCount === 0;
}

async function getUniqueToken() {
  let token;
  do {
    token = generateToken();
  } while (!(await isTokenUnique(token)));
  return token;
}

// Add a single candidate
const addCandidate = async ({
  first_name,
  last_name,
  email_id,
  phone_number,
  applied_position,
}) => {
  const candidate_token = await getUniqueToken();
  const query = `
    INSERT INTO candidate_info (candidate_token, first_name, last_name, email_id, phone_number, applied_position)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [
    candidate_token,
    first_name,
    last_name,
    email_id,
    phone_number,
    applied_position,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Bulk insert candidates (for Excel import)
const addCandidatesBulk = async (candidates) => {
  const inserted = [];
  for (const c of candidates) {
    try {
      const res = await addCandidate(c);
      inserted.push(res);
    } catch (e) {
      // skip duplicates or errors
    }
  }
  return inserted;
};

module.exports = { addCandidate, addCandidatesBulk };
