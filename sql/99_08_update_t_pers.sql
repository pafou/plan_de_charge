-- Update t_pers with team IDs
UPDATE t_pers SET id_team = 12304 WHERE id_pers IN (1, 2, 3);
UPDATE t_pers SET id_team = 234 WHERE id_pers = 666;
