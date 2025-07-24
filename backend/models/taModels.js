const pool = require("../config/db");

const createDrive = async ({
  drive_name,
  drive_date,
  bu_id,
  mode_of_interview,
  country,
  state,
  city,
  building,
  drive_details,
  no_of_openings,
  no_of_panel_rounds,
  created_by,
}) => {
  const query = `
    INSERT INTO drives (
      drive_name, drive_date, bu_id, mode_of_interview, country, state, city, building, drive_details, no_of_openings, no_of_panel_rounds, created_by
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *;
  `;
  const values = [
    drive_name,
    drive_date,
    bu_id,
    mode_of_interview,
    country,
    state,
    city,
    building,
    drive_details,
    Number(no_of_openings),
    Number(no_of_panel_rounds),
    created_by,
  ];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    // console.error("Error saving drive:", err);
    throw err;
  }
};

module.exports = { createDrive };
const getAllDrives = async () => {
  const query = `SELECT * FROM drives ORDER BY created_at DESC;`;
  const result = await pool.query(query);
  return result.rows;
};


const getAllInterviewRooms = async () => {
  const query = `SELECT * FROM interview_rooms ORDER BY created_at DESC;`;
  const result = await pool.query(query);
  return result.rows;
};

const getColleagues = async () => {
  const query = `SELECT * FROM employee_info where role = 'Colleague' ORDER BY first_name DESC;`;
  const result = await pool.query(query);
  return result.rows;
};



const createPanel = async ({
  panel_name,
  interview_level,
  panel_members,
  interview_room_id,
  drive_id,
}) => {
  const query = `
    INSERT INTO panels (
      panel_name, interview_level, panel_members, interview_room_id, drive_id
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [
    panel_name,
    interview_level,
    JSON.stringify(panel_members),
    interview_room_id,
    drive_id,
  ];
  // console.log('Creating panel with values:', values);

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    // console.error("❌ Error inserting panel into DB:", err.stack);
    throw err;
  }
};

const getAssignedInterviewRoomIds = async () => {
  const query = `SELECT DISTINCT interview_room_id FROM panels WHERE interview_room_id IS NOT NULL`;
  const { rows } = await pool.query(query);
  return rows.map((row) => row.interview_room_id);
};

module.exports = { 
  createDrive, 
  getAllDrives, 
  getAllInterviewRooms,
  getColleagues,
  createPanel,
  getAssignedInterviewRoomIds
};
