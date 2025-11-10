-- First, truncate the tables to ensure we start with a clean state
-- TRUNCATE TABLE t_pdc, t_comment, t_pers, t_subjects CASCADE;

-- Test data for t_pers
INSERT INTO t_pers (ID_pers, name, firstname) VALUES
(666,'Fournier', 'Paul');

-- Test data for t_comment
INSERT INTO t_comment (ID_pers, ID_subject, comment) VALUES
(666, 1, 'Fait des algo de folie.'),
(666, 2, 'Eclate en science, meca surtout.'),
(666, 3, 'Histoire mini.'),
(666, 4, 'Literature sur le tard.');

-- Test data for t_pdc
-- We'll create 40 unique rows with combinations of persons and subjects
-- Using a more controlled approach to ensure uniqueness
INSERT INTO t_pdc (ID_pers, ID_subject, month, load) VALUES
-- Person 1
(666, 1, '2023-01-01', 1),
(666, 2, '2023-02-01', 2),
(666, 3, '2023-03-01', 3),
(666, 4, '2023-04-01', 4),
(666, 5, '2023-05-01', 5),
(666, 1, '2024-04-01', 6),
(666, 2, '2024-05-01', 7),
(666, 3, '2024-06-01', 8),
(666, 4, '2024-07-01', 9),
(666, 5, '2024-08-01', 10),
(666, 1, '2024-09-01', 11),
(666, 2, '2024-10-01', 12),
(666, 3, '2024-11-01', 13),
(666, 4, '2024-12-01', 14),
(666, 5, '2025-01-01', 16);