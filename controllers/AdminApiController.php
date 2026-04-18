<?php

declare(strict_types=1);

final class AdminApiController
{
    public function listUsers(): void
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $model = new AdminUserModel();
            $rows = $model->fetchUsers();
            $out = [];
            foreach ($rows as $r) {
                $out[] = [
                    'id' => (int) ($r['id'] ?? 0),
                    'username' => (string) ($r['username'] ?? ''),
                    'last_seen' => $this->toIsoOrNull($r['last_seen'] ?? null),
                    'expense_count' => (int) ($r['expense_count'] ?? 0),
                ];
            }
            echo json_encode($out);
        } catch (Throwable $e) {
            http_response_code(500);
            header('Content-Type: text/plain; charset=utf-8');
            echo $e->getMessage();
        }
    }

    public function deleteUser(int $id): void
    {
        if ($id <= 0) {
            http_response_code(400);
            header('Content-Type: text/plain; charset=utf-8');
            echo 'Invalid id';
            return;
        }
        try {
            $model = new AdminUserModel();
            $affected = $model->deleteUserById($id);
            if ($affected === 0) {
                http_response_code(404);
                return;
            }
            http_response_code(204);
        } catch (Throwable $e) {
            http_response_code(500);
            header('Content-Type: text/plain; charset=utf-8');
            echo $e->getMessage();
        }
    }

    private function toIsoOrNull(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        if ($value instanceof DateTimeInterface) {
            return $value->format('c');
        }
        if (is_string($value)) {
            $ts = strtotime($value);
            if ($ts === false) {
                return null;
            }
            return gmdate('c', $ts);
        }
        return null;
    }
}
