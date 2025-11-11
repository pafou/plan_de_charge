CREATE TABLE t_pers (
    ID_pers SERIAL PRIMARY KEY,
    name VARCHAR(100),
    firstname VARCHAR(100)
);

CREATE TABLE t_subjects (
    ID_subject SERIAL PRIMARY KEY,
    subject VARCHAR(100)
);

CREATE TABLE t_comment (
    ID_pers INT REFERENCES t_pers(ID_pers),
    ID_subject INT REFERENCES t_subjects(ID_subject),
    comment TEXT
);

CREATE TABLE t_pdc (
    ID_pers INT REFERENCES t_pers(ID_pers),
    ID_subject INT REFERENCES t_subjects(ID_subject),
    month DATE CHECK (
        -- Vérifie que la date est bien le premier jour du mois
        EXTRACT(DAY FROM month) = 1
    ),
    load INT CHECK (load BETWEEN 0 AND 31),
    PRIMARY KEY (ID_pers, ID_subject, month)
);

CREATE TABLE t_teams (
    ID_team SERIAL PRIMARY KEY,
    team VARCHAR(100)
);

ALTER TABLE t_pers
ADD COLUMN ID_team INTEGER,
ADD CONSTRAINT fk_team
FOREIGN KEY (ID_team)
REFERENCES t_teams (ID_team);
