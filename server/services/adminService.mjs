import { getPool } from "../db/pool.mjs";

export async function fetchUsers() {
  const pool = getPool();
  const [rows] = await pool.query(
    "SELECT id, username, last_seen, (SELECT COUNT(*) FROM expenses WHERE user_id = users.id) as expense_count FROM users"
  );
  return rows;
}

export async function deleteUserById(id) {
  const pool = getPool();
  const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [id]);
  return result;
}

