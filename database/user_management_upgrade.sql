-- Mise à jour depuis un dump minimal (sans full_name). Exécuter une seule fois dans phpMyAdmin.
-- La table créée par user_management.sql contient déjà UNIQUE sur username et email : ne pas re-ajouter ces index.
USE `user_management`;

-- Si la colonne existe déjà, cette ligne échouera : ignorer l'erreur ou exécuter seulement si besoin.
ALTER TABLE `users` ADD COLUMN `full_name` varchar(150) DEFAULT NULL AFTER `email`;
