-- Update t_pers with team IDs
-- (234, 'Platform Engineering');
UPDATE t_pers SET id_team = 2 WHERE id_pers IN (222, 2222, 2225);
-- (12304, 'Digital Factory'),
UPDATE t_pers SET id_team = 7 WHERE id_pers IN (777, 7772, 7998, 7225);
-- IAD
UPDATE t_pers SET id_team = 6 WHERE id_pers IN (666);