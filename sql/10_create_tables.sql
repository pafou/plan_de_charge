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

ALTER TABLE t_teams
ADD COLUMN id_manager INTEGER,
ADD CONSTRAINT fk_manager
FOREIGN KEY (id_manager)
REFERENCES t_pers (id_pers);



CREATE TABLE t_admin (
    id_pers INT REFERENCES t_pers(id_pers)
);

CREATE TABLE t_subjects (
    id_subject SERIAL PRIMARY KEY,
    subject VARCHAR(100)
);

CREATE TABLE t_comment (
    id_pers INT REFERENCES t_pers(id_pers),
    id_subject INT REFERENCES t_subjects(id_subject),
    comment TEXT
);

CREATE TABLE t_pdc (
    id_pers INT REFERENCES t_pers(id_pers),
    id_subject INT REFERENCES t_subjects(id_subject),
    month DATE CHECK (
        -- Vérifie que la date est bien le premier jour du mois
        EXTRACT(DAY FROM month) = 1
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
