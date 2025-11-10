"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 5001;
// Set up database connection
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// API endpoint to fetch data
app.get('/api/data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield pool.query(query);
        res.json(result.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// API endpoint to fetch persons
app.get('/api/persons', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = 'SELECT ID_pers, name, firstname FROM t_pers';
        const result = yield pool.query(query);
        res.json(result.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// API endpoint to fetch subjects
app.get('/api/subjects', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = 'SELECT ID_subject, subject FROM t_subjects';
        const result = yield pool.query(query);
        res.json(result.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// API endpoint to fetch data as HTML table
app.get('/api/list_all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield pool.query(query);
        const data = result.rows;
        // Group data by person and subject
        const groupedData = {};
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
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}));
// API endpoint to handle submit operation
app.post('/api/submit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ID_pers, ID_subject, month, load } = req.body;
    try {
        // Check if the record exists
        const checkQuery = `
      SELECT * FROM t_pdc
      WHERE ID_pers = $1 AND ID_subject = $2 AND month = $3
    `;
        const checkResult = yield pool.query(checkQuery, [ID_pers, ID_subject, month]);
        if (checkResult.rows.length > 0) {
            // Record exists, update the load value
            const updateQuery = `
        UPDATE t_pdc
        SET load = $1
        WHERE ID_pers = $2 AND ID_subject = $3 AND month = $4
      `;
            yield pool.query(updateQuery, [load, ID_pers, ID_subject, month]);
            res.json({ message: 'Record updated successfully' });
        }
        else {
            // Record doesn't exist, insert a new record
            const insertQuery = `
        INSERT INTO t_pdc (ID_pers, ID_subject, month, load)
        VALUES ($1, $2, $3, $4)
      `;
            yield pool.query(insertQuery, [ID_pers, ID_subject, month, load]);
            res.json({ message: 'Record inserted successfully' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
app.get('/', (req, res) => {
    res.send('plan de charge');
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
