<?php

/**
 * File: models/UserModel.php
 * Purpose: users table CRUD and password check for web auth
 * Routes: N/A (used by AuthController)
 */

declare(strict_types=1);

final class UserModel
{
    public function findByUsernameOrEmail(string $login): ?array
    {
        $q = trim($login);
        if ($q === '') {
            return null;
        }
        $stmt = Database::pdo()->prepare(
            'SELECT id, username, email, full_name, password, created_at FROM users '
            . 'WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1'
        );
        $stmt->execute([$q, $q]);
        $row = $stmt->fetch();
        return is_array($row) ? $row : null;
    }

    public function usernameExists(string $username): bool
    {
        $stmt = Database::pdo()->prepare(
            'SELECT 1 FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1'
        );
        $stmt->execute([trim($username)]);
        return (bool) $stmt->fetchColumn();
    }

    public function emailExists(string $email): bool
    {
        $stmt = Database::pdo()->prepare(
            'SELECT 1 FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1'
        );
        $stmt->execute([trim($email)]);
        return (bool) $stmt->fetchColumn();
    }

    /**
     * @return array{id: int, username: string, email: string, full_name: ?string, created_at: string}
     */
    public function create(string $username, string $email, string $password, string $fullName): array
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO users (username, email, full_name, password) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([trim($username), trim($email), $fullName === '' ? null : trim($fullName), trim($password)]);
        $id = (int) Database::pdo()->lastInsertId();
        $row = $id > 0 ? $this->findById($id) : null;
        if ($row === null) {
            $row = $this->findByUsernameOrEmail(trim($email))
                ?? $this->findByUsernameOrEmail(trim($username));
        }
        if ($row === null) {
            throw new RuntimeException('User not found after insert.');
        }
        return $this->publicUserRow($row);
    }

    public function findById(int $id): ?array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT id, username, email, full_name, password, created_at FROM users WHERE id = ? LIMIT 1'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return is_array($row) ? $row : null;
    }

    /**
     * @param array<string, mixed> $row
     * @return array{id: int, username: string, email: string, full_name: ?string, created_at: string}
     */
    public function publicUserRow(array $row): array
    {
        $created = $row['created_at'] ?? '';
        if ($created instanceof DateTimeInterface) {
            $created = $created->format('c');
        } elseif (is_string($created)) {
            $ts = strtotime($created);
            $created = $ts !== false ? gmdate('c', $ts) : '';
        } else {
            $created = '';
        }
        return [
            'id' => (int) ($row['id'] ?? 0),
            'username' => (string) ($row['username'] ?? ''),
            'email' => (string) ($row['email'] ?? ''),
            'full_name' => isset($row['full_name']) && $row['full_name'] !== ''
                ? (string) $row['full_name'] : null,
            'created_at' => $created,
        ];
    }

    public function verifyPassword(string $plain, string $stored): bool
    {
        return trim((string) $stored) === trim((string) $plain);
    }
}
