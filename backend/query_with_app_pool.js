const pool = require("./db/pool");
async function test() {
  try {
    const res = await pool.query("SELECT * FROM patients");
    console.log("Patients count:", res.rows.length);
    console.log(res.rows);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    pool.end();
  }
}
test();
