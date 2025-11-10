-- First, truncate the tables to ensure we start with a clean state
TRUNCATE TABLE t_pdc, t_comment, t_pers, t_subjects CASCADE;

-- Test data for t_pers
INSERT INTO t_pers (name, firstname) VALUES
('Doe', 'John'),
('Smith', 'Jane'),
('Brown', 'Bob');

-- Test data for t_subjects
INSERT INTO t_subjects (subject) VALUES
('Math'),
('Science'),
('History'),
('Literature'),
('Art');

-- Test data for t_comment
INSERT INTO t_comment (ID_pers, ID_subject, comment) VALUES
(1, 1, 'Great math class!'),
(2, 2, 'Science is fascinating.'),
(3, 3, 'History is so interesting.'),
(1, 4, 'I love literature.');

-- Test data for t_pdc
-- We'll create 40 unique rows with combinations of persons and subjects
-- Using a more controlled approach to ensure uniqueness
INSERT INTO t_pdc (ID_pers, ID_subject, month, load) VALUES
-- Person 1
(1, 1, '2023-01-01', 10),
(1, 2, '2023-02-01', 15),
(1, 3, '2023-03-01', 20),
(1, 4, '2023-04-01', 25),
(1, 5, '2023-05-01', 30),
-- Person 2
(2, 1, '2023-06-01', 5),
(2, 2, '2023-07-01', 10),
(2, 3, '2023-08-01', 15),
(2, 4, '2023-09-01', 20),
(2, 5, '2023-10-01', 25),
-- Person 3
(3, 1, '2023-11-01', 30),
(3, 2, '2023-12-01', 5),
(3, 3, '2024-01-01', 10),
(3, 4, '2024-02-01', 15),
(3, 5, '2024-03-01', 20),
-- Additional entries
(1, 1, '2024-04-01', 25),
(1, 2, '2024-05-01', 30),
(1, 3, '2024-06-01', 5),
(1, 4, '2024-07-01', 10),
(1, 5, '2024-08-01', 15),
(2, 1, '2024-09-01', 20),
(2, 2, '2024-10-01', 25),
(2, 3, '2024-11-01', 30),
(2, 4, '2024-12-01', 5),
(2, 5, '2025-01-01', 10),
(3, 1, '2025-02-01', 15),
(3, 2, '2025-03-01', 20),
(3, 3, '2025-04-01', 25),
(3, 4, '2025-05-01', 30),
(3, 5, '2025-06-01', 5),
(1, 1, '2025-07-01', 10),
(1, 2, '2025-08-01', 15),
(1, 3, '2025-09-01', 20),
(1, 4, '2025-10-01', 25),
(1, 5, '2025-11-01', 30),
(2, 1, '2025-12-01', 5),
(2, 2, '2026-01-01', 10),
(2, 3, '2026-02-01', 15),
(2, 4, '2026-03-01', 20),
(2, 5, '2026-04-01', 25),
(3, 1, '2026-05-01', 30),
(3, 2, '2026-06-01', 5),
(3, 3, '2026-07-01', 10),
(3, 4, '2026-08-01', 15),
(3, 5, '2026-09-01', 20),
(1, 1, '2026-10-01', 25),
(1, 2, '2026-11-01', 30);