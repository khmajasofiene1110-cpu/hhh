<?php

declare(strict_types=1);

/**
 * MySQL-backed admin user listing (same queries as server/services/adminService.mjs).
 */
final class AdminUserModel
{
    /**
     * @return list<array{id:int|string, username:mixed, last_seen:mixed, expense_count:int|float}>
     */
    public function fetchUsers(): array
    {
        $sql = 'SELECT id, username, created_at AS last_seen, 0 AS expense_count FROM users ORDER BY id ASC';
        $stmt = Database::pdo()->query($sql);
        $rows = $stmt->fetchAll();
        return is_array($rows) ? $rows : [];
    }

    public function deleteUserById(int $id): int
    {
        $stmt = Database::pdo()->prepare('DELETE FROM users WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }
}
