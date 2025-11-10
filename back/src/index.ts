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

// API endpoint to fetch data
app.get('/api/data', async (req, res) => {
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
    res.json(result.rows);
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
