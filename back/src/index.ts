import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = 5001;

// Set up database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());
app.use(cors());

interface DataRow {
  ID_pers: number;
  name: string;
  firstname: string;
  subject: string;
  comment?: string;
  month: string;
  load: number;
}

interface GroupedDataItem {
  name: string;
  firstname: string;
  subject: string;
  comment: string;
  loads: { [key: string]: number };
}

// API endpoint to fetch data
app.get('/api/data', async (req, res) => {
  try {
    const query = `
      SELECT
        p.ID_pers,
        pdc.ID_subject,
        p.name,
        p.firstname,
        s.subject,
        c.comment,
        pdc.month,
        pdc.load
      FROM
        t_pdc pdc
      JOIN
        t_pers p ON pdc.ID_pers = p.ID_pers
      JOIN
        t_subjects s ON pdc.ID_subject = s.ID_subject
      LEFT JOIN
        t_comment c ON pdc.ID_pers = c.ID_pers AND pdc.ID_subject = c.ID_subject
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
    const query = 'SELECT ID_pers, name, firstname FROM t_pers';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to fetch subjects
app.get('/api/subjects', async (req, res) => {
  try {
    const query = 'SELECT ID_subject, subject FROM t_subjects';
    const result = await pool.query(query);
    res.json(result.rows);
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
        p.ID_pers,
        p.name,
        p.firstname,
        s.subject,
        c.comment,
        pdc.month,
        pdc.load
      FROM
        t_pdc pdc
      JOIN
        t_pers p ON pdc.ID_pers = p.ID_pers
      JOIN
        t_subjects s ON pdc.ID_subject = s.ID_subject
      LEFT JOIN
        t_comment c ON pdc.ID_pers = c.ID_pers AND pdc.ID_subject = c.ID_subject
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
    html += '<thead><tr><th>Name</th><th>Firstname</th><th>Subject</th><th>Comment</th>';
    months.forEach(month => {
      html += `<th>${new Date(month).toLocaleDateString()}</th>`;
    });
    html += '</tr></thead><tbody>';

    groupedArray.forEach(item => {
      html += '<tr>';
      html += `<td>${item.name}</td>`;
      html += `<td>${item.firstname}</td>`;
      html += `<td>${item.subject}</td>`;
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
    res.status(500).send('Internal Server Error');
  }
});

// API endpoint to handle submit operation
app.post('/api/submit', async (req, res) => {
  const { ID_pers, ID_subject, month, load } = req.body;

  try {
    // Check if the record exists
    const checkQuery = `
      SELECT * FROM t_pdc
      WHERE ID_pers = $1 AND ID_subject = $2 AND month = $3
    `;
    const checkResult = await pool.query(checkQuery, [ID_pers, ID_subject, month]);

    if (checkResult.rows.length > 0) {
      // Record exists, update the load value
      const updateQuery = `
        UPDATE t_pdc
        SET load = $1
        WHERE ID_pers = $2 AND ID_subject = $3 AND month = $4
      `;
      await pool.query(updateQuery, [load, ID_pers, ID_subject, month]);
      res.json({ message: 'Record updated successfully' });
    } else {
      // Record doesn't exist, insert a new record
      const insertQuery = `
        INSERT INTO t_pdc (ID_pers, ID_subject, month, load)
        VALUES ($1, $2, $3, $4)
      `;
      await pool.query(insertQuery, [ID_pers, ID_subject, month, load]);
      res.json({ message: 'Record inserted successfully' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', (req, res) => {
  res.send('plan de charge');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
