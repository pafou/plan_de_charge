-- Update t_teams with manager IDs
UPDATE t_teams
SET id_manager = 1
WHERE id_team = 12304;

UPDATE t_teams
SET id_manager = 666
WHERE id_team = 234;
