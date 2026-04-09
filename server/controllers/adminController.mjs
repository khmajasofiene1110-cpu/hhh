import * as adminService from "../services/adminService.mjs";

function toIsoOrNull(value) {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") {
    const ts = Date.parse(value);
    if (Number.isNaN(ts)) return null;
    return new Date(ts).toISOString();
  }
  return null;
}

function toNumber(value) {
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function getUsers(req, res, next) {
  try {
    const rows = await adminService.fetchUsers();
    const mapped = rows.map((r) => ({
      id: toNumber(r.id),
      username: String(r.username ?? ""),
      last_seen: toIsoOrNull(r.last_seen),
      expense_count: toNumber(r.expense_count),
    }));
    res.json(mapped);
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).send("Invalid id");
      return;
    }
    const result = await adminService.deleteUserById(id);
    const affected = toNumber(result.affectedRows);
    if (affected === 0) {
      res.sendStatus(404);
      return;
    }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

