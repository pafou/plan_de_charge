import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';

// Set up database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());
app.use(cors());

interface DataRow {
  id_pers: number;
  name: string;
  firstname: string;
  subject: string;
  type: string;
  comment?: string;
  month: string;
  load: number;
}

interface GroupedDataItem {
  name: string;
  firstname: string;
  subject: string;
  type: string;
  comment: string;
  loads: { [key: string]: number };
}

// API endpoint to fetch data
app.get('/api/data', async (req, res) => {
  try {
    const query = `
      SELECT
        p.id_pers,
        pdc.id_subject,
        p.name,
        p.firstname,
        t.team,
        s.subject,
        st.type,
        c.comment,
        pdc.month,
        pdc.load,
        st.color_hex
      FROM
        t_pdc pdc
      JOIN
        t_pers p ON pdc.id_pers = p.id_pers
      JOIN
        t_subjects s ON pdc.id_subject = s.id_subject
      LEFT JOIN
        t_comment c ON pdc.id_pers = c.id_pers AND pdc.id_subject = c.id_subject
      LEFT JOIN
        t_teams t ON p.id_team = t.id_team
      LEFT JOIN
        t_subject_types st ON s.id_subject_type = st.id_subject_type
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to fetch persons
app.get('/api/persons', async (req, res) => {
  try {
    const query = 'SELECT id_pers, name, firstname FROM t_pers';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to fetch admins
app.get('/api/admins', async (req, res) => {
  try {
    const query = `
      SELECT p.id_pers, p.name, p.firstname
      FROM t_admin a
      JOIN t_pers p ON a.id_pers = p.id_pers
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to delete an admin
app.delete('/api/admins/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM t_admin WHERE id_pers = $1';
    await pool.query(query, [id]);
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to add a user as an admin
app.post('/api/admins', async (req, res) => {
  const { id_pers } = req.body;

  try {
    const query = 'INSERT INTO t_admin (id_pers) VALUES ($1)';
    await pool.query(query, [id_pers]);
    res.json({ message: 'User added as admin successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to fetch teams and their managers
app.get('/api/teams', async (req, res) => {
  try {
    const query = `
      SELECT
        t.id_team,
        t.team,
        p.id_pers AS manager_id,
        p.name AS manager_name,
        p.firstname AS manager_firstname
      FROM
        t_teams t
      LEFT JOIN
        t_teams_managers tm ON t.id_team = tm.id_team
      LEFT JOIN
        t_pers p ON tm.id_pers = p.id_pers
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to delete a team
app.delete('/api/teams/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM t_teams WHERE id_team = $1';
    await pool.query(query, [id]);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to add a team
app.post('/api/teams', async (req, res) => {
  const { id_team, team } = req.body;

  try {
    const query = 'INSERT INTO t_teams (id_team, team) VALUES ($1, $2)';
    await pool.query(query, [id_team, team]);
    res.json({ message: 'Team added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to generate JWT token for selected user
app.post('/api/generate-token', (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to fetch subjects
app.get('/api/subjects', async (req, res) => {
  try {
    const query = `
      SELECT
        s.id_subject,
        s.subject,
        st.id_subject_type,
        st.type
      FROM
        t_subjects s
      LEFT JOIN
        t_subject_types st ON s.id_subject_type = st.id_subject_type
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to fetch subject types
app.get('/api/subject-types', async (req, res) => {
  try {
    const query = 'SELECT id_subject_type, type, color_hex FROM t_subject_types';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to add a subject type
app.post('/api/subject-types', async (req, res) => {
  const { type } = req.body;

  try {
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }

    const query = 'INSERT INTO t_subject_types (type) VALUES ($1) RETURNING id_subject_type';
    const result = await pool.query(query, [type]);
    res.json({ id_subject_type: result.rows[0].id_subject_type, message: 'Subject type added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to update a subject type
app.put('/api/subject-types/:id', async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;

  try {
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }

    const query = 'UPDATE t_subject_types SET type = $1 WHERE id_subject_type = $2';
    await pool.query(query, [type, id]);
    res.json({ message: 'Subject type updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to update a subject type color
app.put('/api/subject-types/:id/color', async (req, res) => {
  const { id } = req.params;
  const { color } = req.body;

  try {
    if (!color) {
      return res.status(400).json({ error: 'Color is required' });
    }

    const query = 'UPDATE t_subject_types SET color_hex = $1 WHERE id_subject_type = $2';
    await pool.query(query, [color, id]);
    res.json({ message: 'Subject type color updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to delete a subject type
app.delete('/api/subject-types/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM t_subject_types WHERE id_subject_type = $1';
    await pool.query(query, [id]);
    res.json({ message: 'Subject type deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to delete a subject
app.delete('/api/subjects/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM t_subjects WHERE id_subject = $1';
    await pool.query(query, [id]);
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to update a subject
app.put('/api/subjects/:id', async (req, res) => {
  const { id } = req.params;
  const { subject, id_subject_type } = req.body;

  try {
    if (!subject && !id_subject_type) {
      return res.status(400).json({ error: 'Subject or id_subject_type is required' });
    }

    if (subject && id_subject_type) {
      const query = 'UPDATE t_subjects SET subject = $1, id_subject_type = $2 WHERE id_subject = $3';
      await pool.query(query, [subject, id_subject_type, id]);
      res.json({ message: 'Subject updated successfully' });
    } else if (subject) {
      const query = 'UPDATE t_subjects SET subject = $1 WHERE id_subject = $2';
      await pool.query(query, [subject, id]);
      res.json({ message: 'Subject updated successfully' });
    } else {
      const query = 'UPDATE t_subjects SET id_subject_type = $1 WHERE id_subject = $2';
      await pool.query(query, [id_subject_type, id]);
      res.json({ message: 'Subject type updated successfully' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to add a subject
app.post('/api/subjects', async (req, res) => {
  const { subject, id_subject_type } = req.body;

  try {
    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    const query = 'INSERT INTO t_subjects (subject, id_subject_type) VALUES ($1, $2) RETURNING id_subject';
    const result = await pool.query(query, [subject, id_subject_type]);
    res.json({ id_subject: result.rows[0].id_subject, message: 'Subject added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to fetch data as HTML table
app.get('/api/list_all', async (req, res) => {
  try {
    const query = `
      SELECT
        p.id_pers,
        p.name,
        p.firstname,
        s.subject,
        c.comment,
        pdc.month,
        pdc.load
      FROM
        t_pdc pdc
      JOIN
        t_pers p ON pdc.id_pers = p.id_pers
      JOIN
        t_subjects s ON pdc.id_subject = s.id_subject
      LEFT JOIN
        t_comment c ON pdc.id_pers = c.id_pers AND pdc.id_subject = c.id_subject
    `;
    const result = await pool.query(query);
    const data = result.rows as DataRow[];

    // Group data by person and subject
    const groupedData: { [key: string]: GroupedDataItem } = {};
    data.forEach(row => {
      const key = `${row.name}-${row.firstname}-${row.subject}-${row.comment || 'No comment'}`;
      if (!groupedData[key]) {
        groupedData[key] = {
          name: row.name,
          firstname: row.firstname,
          subject: row.subject,
          type: row.type,
          comment: row.comment || 'No comment',
          loads: {},
        };
      }
      groupedData[key].loads[row.month] = row.load;
    });

    // Generate HTML table
    const groupedArray = Object.values(groupedData);
    const months = Array.from(new Set(data.map(row => row.month))).sort();

    let html = '<table border="1">';
    html += '<thead><tr><th>Name</th><th>Firstname</th><th>Subject</th><th>Type</th><th>Comment</th>';
    months.forEach(month => {
      html += `<th>${new Date(month).toLocaleDateString()}</th>`;
    });
    html += '</tr></thead><tbody>';

    groupedArray.forEach(item => {
      html += '<tr>';
      html += `<td>${item.name}</td>`;
      html += `<td>${item.firstname}</td>`;
      html += `<td>${item.subject}</td>`;
      html += `<td>${item.type}</td>`;
      html += `<td>${item.comment}</td>`;
      months.forEach(month => {
        html += `<td>${item.loads[month] || 0}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to handle submit operation
app.post('/api/submit', async (req, res) => {
  const { id_pers, id_subject, month, load } = req.body;

  // Log the received data for debugging
  console.log('Received data:', { id_pers, id_subject, month, load });

  try {
    // Check if the record exists
    const checkQuery = `
      SELECT * FROM t_pdc
      WHERE id_pers = $1 AND id_subject = $2 AND month = $3
    `;
    const checkResult = await pool.query(checkQuery, [id_pers, id_subject, month]);

    if (checkResult.rows.length > 0) {
      // Record exists, update the load value
      const updateQuery = `
        UPDATE t_pdc
        SET load = $1
        WHERE id_pers = $2 AND id_subject = $3 AND month = $4
      `;
      await pool.query(updateQuery, [load, id_pers, id_subject, month]);
      res.json({ message: 'Record updated successfully' });
    } else {
      // Record doesn't exist, insert a new record
      const insertQuery = `
        INSERT INTO t_pdc (id_pers, id_subject, month, load)
        VALUES ($1, $2, $3, $4)
      `;
      await pool.query(insertQuery, [id_pers, id_subject, month, load]);
      res.json({ message: 'Record inserted successfully' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to update a comment
app.post('/api/updateComment', async (req, res) => {
  const { id_pers, id_subject, comment } = req.body;

  try {
    // Check if the comment exists
    const checkQuery = `
      SELECT * FROM t_comment
      WHERE id_pers = $1 AND id_subject = $2
    `;
    const checkResult = await pool.query(checkQuery, [id_pers, id_subject]);

    if (checkResult.rows.length > 0) {
      // Comment exists, update the comment value
      const updateQuery = `
        UPDATE t_comment
        SET comment = $1
        WHERE id_pers = $2 AND id_subject = $3
      `;
      await pool.query(updateQuery, [comment, id_pers, id_subject]);
      res.json({ message: 'Comment updated successfully' });
    } else {
      // Comment doesn't exist, insert a new record
      const insertQuery = `
        INSERT INTO t_comment (id_pers, id_subject, comment)
        VALUES ($1, $2, $3)
      `;
      await pool.query(insertQuery, [id_pers, id_subject, comment]);
      res.json({ message: 'Comment inserted successfully' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to check if a user is an admin
app.get('/api/is-admin', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET) as { userId: number };
    const { userId } = decodedToken;

    const query = 'SELECT 1 FROM t_admin WHERE id_pers = $1';
    const result = await pool.query(query, [userId]);

    if (result.rows.length > 0) {
      res.json({ isAdmin: true });
    } else {
      res.json({ isAdmin: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to fetch persons whose id_pers matches id_team in t_teams_managers
app.get('/api/team-managers', async (req, res) => {
  try {
    const query = `
      SELECT
        p.id_pers,
        p.name,
        p.firstname,
        tm.id_team
      FROM
        t_teams_managers tm
      JOIN
        t_pers p ON tm.id_pers = p.id_pers
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to fetch teams with their managers
app.get('/api/teams-with-managers', async (req, res) => {
  try {
    const query = `
      SELECT
        t.id_team,
        t.team,
        p.id_pers AS manager_id,
        p.name AS manager_name,
        p.firstname AS manager_firstname
      FROM
        t_teams t
      LEFT JOIN
        t_teams_managers tm ON t.id_team = tm.id_team
      LEFT JOIN
        t_pers p ON tm.id_pers = p.id_pers
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to fetch team members
app.get('/api/team-members', async (req, res) => {
  try {
    const query = `
      SELECT
        p.id_pers,
        p.name,
        p.firstname,
        t.id_team
      FROM
        t_pers p
      LEFT JOIN
        t_teams t ON p.id_team = t.id_team
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to update a team member
app.put('/api/team-members/update', async (req, res) => {
  const { id_pers, id_team } = req.body;

  try {
    if (!id_pers) {
      return res.status(400).json({ error: 'id_pers is required' });
    }

    const query = 'UPDATE t_pers SET id_team = $1 WHERE id_pers = $2';
    await pool.query(query, [id_team, id_pers]);
    res.json({ message: 'Team member updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to create a new team member
app.post('/api/team-members/create', async (req, res) => {
  const { id_pers, name, firstname, id_team } = req.body;

  try {
    if (!name || !firstname) {
      return res.status(400).json({ error: 'name and firstname are required' });
    }

    if (id_pers) {
      // If ID is provided, check if it already exists
      const checkQuery = 'SELECT 1 FROM t_pers WHERE id_pers = $1';
      const checkResult = await pool.query(checkQuery, [id_pers]);

      if (checkResult.rows.length > 0) {
        return res.status(400).json({ error: 'ID already exists' });
      }

      const query = 'INSERT INTO t_pers (id_pers, name, firstname, id_team) VALUES ($1, $2, $3, $4) RETURNING id_pers';
      const result = await pool.query(query, [id_pers, name, firstname, id_team]);
      res.json({ id_pers: result.rows[0].id_pers, message: 'Team member added successfully' });
    } else {
      // If ID is not provided, auto-generate it
      const query = 'INSERT INTO t_pers (name, firstname, id_team) VALUES ($1, $2, $3) RETURNING id_pers';
      const result = await pool.query(query, [name, firstname, id_team]);
      res.json({ id_pers: result.rows[0].id_pers, message: 'Team member added successfully' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to update a team member's team
app.put('/api/team-members/:id', async (req, res) => {
  const { id } = req.params;
  const { id_team } = req.body;

  try {
    const query = 'UPDATE t_pers SET id_team = $1 WHERE id_pers = $2';
    await pool.query(query, [id_team, id]);
    res.json({ message: 'Team member updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to delete a team member
app.delete('/api/team-members/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // First, remove entries from t_teams_managers where id_pers matches
    await pool.query('DELETE FROM t_teams_managers WHERE id_pers = $1', [id]);

    // Then, remove entries from t_pdc where id_pers matches
    await pool.query('DELETE FROM t_pdc WHERE id_pers = $1', [id]);

    // Finally, delete the team member from t_pers
    await pool.query('DELETE FROM t_pers WHERE id_pers = $1', [id]);

    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to delete a manager from a team
app.delete('/api/teams/:teamId/managers/:managerId', async (req, res) => {
  const { teamId, managerId } = req.params;

  try {
    const query = 'DELETE FROM t_teams_managers WHERE id_team = $1 AND id_pers = $2';
    await pool.query(query, [teamId, managerId]);
    res.json({ message: 'Manager removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to add a manager to a team
app.post('/api/teams/:teamId/managers', async (req, res) => {
  const { teamId } = req.params;
  const { managerId } = req.body;

  try {
    const query = 'INSERT INTO t_teams_managers (id_team, id_pers) VALUES ($1, $2)';
    await pool.query(query, [teamId, managerId]);
    res.json({ message: 'Manager added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to add a new line
app.post('/api/addLine', async (req, res) => {
  const { name, firstname, subject, team } = req.body;

  try {
    // Get the first day of the current month in the format YYYY-MM-01
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const currentMonth = `${firstDayOfMonth.getFullYear()}-${(firstDayOfMonth.getMonth() + 1).toString().padStart(2, '0')}-01`;

    // Find the person ID
    const personQuery = 'SELECT id_pers FROM t_pers WHERE name = $1 AND firstname = $2';
    const personResult = await pool.query(personQuery, [name, firstname]);

    if (personResult.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    const id_pers = personResult.rows[0].id_pers;

    // Find the subject ID
    const subjectQuery = 'SELECT id_subject FROM t_subjects WHERE subject = $1';
    const subjectResult = await pool.query(subjectQuery, [subject]);

    if (subjectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const id_subject = subjectResult.rows[0].id_subject;

    // Check if the record already exists
    const checkQuery = `
      SELECT * FROM t_pdc
      WHERE id_pers = $1 AND id_subject = $2 AND month = $3
    `;
    const checkResult = await pool.query(checkQuery, [id_pers, id_subject, currentMonth]);

    if (checkResult.rows.length > 0) {
      // Record exists, return the existing data
      const dataQuery = `
        SELECT
          p.id_pers,
          s.id_subject,
          p.name,
          p.firstname,
          s.subject,
          st.type,
          c.comment,
          pdc.month,
          pdc.load,
          t.team
        FROM
          t_pdc pdc
        JOIN
          t_pers p ON pdc.id_pers = p.id_pers
        JOIN
          t_subjects s ON pdc.id_subject = s.id_subject
        LEFT JOIN
          t_comment c ON pdc.id_pers = c.id_pers AND pdc.id_subject = c.id_subject
        LEFT JOIN
          t_teams t ON p.id_team = t.id_team
        LEFT JOIN
          t_subject_types st ON s.id_subject_type = st.id_subject_type
        WHERE
          pdc.id_pers = $1 AND pdc.id_subject = $2 AND pdc.month = $3
      `;
      const dataResult = await pool.query(dataQuery, [id_pers, id_subject, currentMonth]);
      res.json(dataResult.rows);
    } else {
      // Record doesn't exist, insert a new record with load = 0
      let insertQuery = `
        INSERT INTO t_pdc (id_pers, id_subject, month, load)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const insertValues = [id_pers, id_subject, currentMonth, 0];

      // If the table has an id_team column, include it in the insert
      try {
        await pool.query('SELECT id_team FROM t_pdc LIMIT 1');
        insertQuery = `
          INSERT INTO t_pdc (id_pers, id_subject, month, load, id_team)
          VALUES ($1, $2, $3, $4, (SELECT id_team FROM t_teams WHERE team = $5))
        `;
        insertValues.push(team);
      } catch (error) {
        if (error.code === '42703') {
          // Column does not exist, continue with the basic insert
        } else {
          throw error;
        }
      }

      const insertResult = await pool.query(insertQuery, insertValues);

      // Return the newly created data
      const dataQuery = `
        SELECT
          p.id_pers,
          s.id_subject,
          p.name,
          p.firstname,
          s.subject,
          st.type,
          c.comment,
          pdc.month,
          pdc.load,
          t.team
        FROM
          t_pdc pdc
        JOIN
          t_pers p ON pdc.id_pers = p.id_pers
        JOIN
          t_subjects s ON pdc.id_subject = s.id_subject
        LEFT JOIN
          t_comment c ON pdc.id_pers = c.id_pers AND pdc.id_subject = c.id_subject
        LEFT JOIN
          t_teams t ON p.id_team = t.id_team
        LEFT JOIN
          t_subject_types st ON s.id_subject_type = st.id_subject_type
        WHERE
          pdc.id_pers = $1 AND pdc.id_subject = $2 AND pdc.month = $3
      `;
      const dataResult = await pool.query(dataQuery, [id_pers, id_subject, currentMonth]);
      res.json(dataResult.rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to add a new line
app.post('/api/addNewLine', async (req, res) => {
  const { id_pers, id_subject } = req.body;

  try {
    const currentDate = new Date();
    // Construire YYYYMM comme nombre
    const currentMonth = Number(
      `${currentDate.getFullYear()}${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`
    );

    // Check if the record already exists
    const checkQuery = `
      SELECT * FROM t_pdc
      WHERE id_pers = $1 AND id_subject = $2 AND month = $3
    `;
    const checkResult = await pool.query(checkQuery, [id_pers, id_subject, currentMonth]);

    if (checkResult.rows.length > 0) {
      // Record exists, return the existing data
      const dataQuery = `
        SELECT
          p.id_pers,
          s.id_subject,
          p.name,
          p.firstname,
          s.subject,
          st.type,
          c.comment,
          pdc.month,
          pdc.load,
          t.team
        FROM
          t_pdc pdc
        JOIN
          t_pers p ON pdc.id_pers = p.id_pers
        JOIN
          t_subjects s ON pdc.id_subject = s.id_subject
        LEFT JOIN
          t_comment c ON pdc.id_pers = c.id_pers AND pdc.id_subject = c.id_subject
        LEFT JOIN
          t_teams t ON p.id_team = t.id_team
        LEFT JOIN
          t_subject_types st ON s.id_subject_type = st.id_subject_type
        WHERE
          pdc.id_pers = $1 AND pdc.id_subject = $2 AND pdc.month = $3
      `;
      const dataResult = await pool.query(dataQuery, [id_pers, id_subject, currentMonth]);
      res.json(dataResult.rows);
    } else {
      // Record doesn't exist, insert a new record with load = 0
      const insertQuery = `
        INSERT INTO t_pdc (id_pers, id_subject, month, load)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const insertValues = [id_pers, id_subject, currentMonth, 0];

      const insertResult = await pool.query(insertQuery, insertValues);

      // Return the newly created data
      const dataQuery = `
        SELECT
          p.id_pers,
          s.id_subject,
          p.name,
          p.firstname,
          s.subject,
          st.type,
          c.comment,
          pdc.month,
          pdc.load,
          t.team
        FROM
          t_pdc pdc
        JOIN
          t_pers p ON pdc.id_pers = p.id_pers
        JOIN
          t_subjects s ON pdc.id_subject = s.id_subject
        LEFT JOIN
          t_comment c ON pdc.id_pers = c.id_pers AND pdc.id_subject = c.id_subject
        LEFT JOIN
          t_teams t ON p.id_team = t.id_team
        LEFT JOIN
          t_subject_types st ON s.id_subject_type = st.id_subject_type
        WHERE
          pdc.id_pers = $1 AND pdc.id_subject = $2 AND pdc.month = $3
      `;
      const dataResult = await pool.query(dataQuery, [id_pers, id_subject, currentMonth]);
      res.json(dataResult.rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to check if a user is a manager and which team they manage
app.get('/api/is-manager', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET) as { userId: number };
    const { userId } = decodedToken;

    const query = `
      SELECT
        tm.id_team,
        t.team
      FROM
        t_teams_managers tm
      JOIN
        t_teams t ON tm.id_team = t.id_team
      WHERE
        tm.id_pers = $1
    `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length > 0) {
      res.json({ isManager: true, team: result.rows[0].team });
    } else {
      res.json({ isManager: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to get related persons based on id_pers
app.get('/api/related-persons', async (req, res) => {
  const { id_pers } = req.query;

  if (!id_pers) {
    return res.status(400).json({ error: 'id_pers is required' });
  }

  try {
    const query = `
      WITH input AS (
        SELECT $1::INT AS id_pers
      )
      SELECT p.id_pers
      FROM input i
      JOIN t_admin a ON a.id_pers = i.id_pers
      JOIN t_pers p ON TRUE

      UNION

      SELECT p.id_pers
      FROM input i
      JOIN t_teams_managers tm ON tm.id_pers = i.id_pers
      JOIN t_pers p ON p.id_team = tm.id_team

      UNION

      SELECT i.id_pers
      FROM input i
      WHERE NOT EXISTS (SELECT 1 FROM t_admin a WHERE a.id_pers = i.id_pers)
        AND NOT EXISTS (SELECT 1 FROM t_teams_managers tm WHERE tm.id_pers = i.id_pers)
    `;
    const result = await pool.query(query, [id_pers]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', (req, res) => {
  res.send('plan de charge');
});

// API endpoint to fetch color mapping from database
app.get('/api/color-mapping', async (req, res) => {
  try {
    const query = 'SELECT id_map, color_hex FROM t_color_mapping ORDER BY id_map';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to update a color mapping
app.put('/api/color-mapping/:id', async (req, res) => {
  const { id } = req.params;
  const { color_hex } = req.body;

  try {
    if (!color_hex) {
      return res.status(400).json({ error: 'Color is required' });
    }

    const query = 'UPDATE t_color_mapping SET color_hex = $1 WHERE id_map = $2';
    await pool.query(query, [color_hex, id]);
    res.json({ message: 'Color mapping updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to add a new color mapping
app.post('/api/color-mapping', async (req, res) => {
  const { id_map, color_hex } = req.body;

  try {
    if (!id_map || !color_hex) {
      return res.status(400).json({ error: 'ID and color are required' });
    }

    const query = 'INSERT INTO t_color_mapping (id_map, color_hex) VALUES ($1, $2)';
    await pool.query(query, [id_map, color_hex]);
    res.json({ message: 'Color mapping added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to delete a color mapping
app.delete('/api/color-mapping/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM t_color_mapping WHERE id_map = $1';
    await pool.query(query, [id]);
    res.json({ message: 'Color mapping deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
