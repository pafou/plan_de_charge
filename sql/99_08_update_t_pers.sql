-- Update t_pers with team IDs
-- (234, 'Platform Engineering');
UPDATE t_pers SET id_team = 234 WHERE id_pers IN (10, 20, 30,777,7772);
-- (12304, 'Digital Factory'),
UPDATE t_pers SET id_team = 12304 WHERE id_pers IN (222, 2222,8998,1225);
-- IAD
UPDATE t_pers SET id_team = 666 WHERE id_pers IN (666);
