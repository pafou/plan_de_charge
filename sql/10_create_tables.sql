CREATE TABLE t_teams (
    id_team SERIAL PRIMARY KEY,
    team VARCHAR(100)
);

CREATE TABLE t_pers (
    id_pers SERIAL PRIMARY KEY,
    name VARCHAR(100),
    firstname VARCHAR(100),
    id_team INTEGER,
    CONSTRAINT fk_team FOREIGN KEY (id_team) REFERENCES t_teams (id_team)
);

CREATE TABLE t_admin (
    id_pers INT REFERENCES t_pers(id_pers)
);

CREATE TABLE t_subject_types (
    id_subject_type SERIAL PRIMARY KEY,
    color_hex VARCHAR(9) CHECK (color_hex ~ '^#[0-9A-Fa-f]{3,8}$'),
    type VARCHAR(100)
);

CREATE TABLE t_subjects (
    id_subject SERIAL PRIMARY KEY,
    subject VARCHAR(100),
    id_subject_type INTEGER,
    CONSTRAINT fk_type FOREIGN KEY (id_subject_type) REFERENCES t_subject_types (id_subject_type)
);

CREATE TABLE t_comment (
    id_pers INT REFERENCES t_pers(id_pers),
    id_subject INT REFERENCES t_subjects(id_subject),
    comment TEXT
);

CREATE TABLE t_pdc (
    id_pers INT REFERENCES t_pers(id_pers),
    id_subject INT REFERENCES t_subjects(id_subject),
    month INT CHECK (
        -- Vérifie que month est bien entre 190001 et 999912
        month BETWEEN 190001 AND 999912
        -- Vérifie que MM est compris entre 01 et 12
        AND (month % 100) BETWEEN 1 AND 12
    ),
    load INT CHECK (load BETWEEN 0 AND 31),
    PRIMARY KEY (id_pers, id_subject, month)
);

CREATE TABLE t_teams_managers (
    id_team INT,
    id_pers INT,
    PRIMARY KEY (id_team, id_pers),
    FOREIGN KEY (id_team) REFERENCES t_teams(id_team),
    FOREIGN KEY (id_pers) REFERENCES t_pers(id_pers)
);

CREATE TABLE t_color_mapping (
    id_map INT,
    color_hex VARCHAR(9) CHECK (color_hex ~ '^#[0-9A-Fa-f]{3,8}$')
);
