const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 5000;

const db = mysql.createConnection({
  host: "localhost",
  user: "new_root",
  password: "root",
  database: "customer_survey",
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to the database');
});

app.use(cors());
app.use(express.json());

// Endpoint to get survey questions
app.get('/api/questions', (req, res) => {
  const sql = "SELECT * FROM survey_questions";
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching questions:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(result);
  });
});
///////////////////////////////////////////////////

// Generate a unique session ID (example using UUID)
const { v4: uuidv4 } = require('uuid');
const customerSessionId = uuidv4();

// Store customerSessionId in the database or session variable

// Modify the POST endpoint to include customerSessionId
app.post('/api/submit', (req, res) => {
  const { customer_session, responses } = req.body;

  // Check if the number of responses matches the number of questions
  if (responses.length !== 5) {
    return res.status(400).json({ error: 'Invalid number of responses' });
  }

  // Insert the responses into the Feedback table
  const sql = "INSERT INTO Feedback (customer_session_id, question_id, rating) VALUES (?, ?, ?)";
  responses.forEach((response, index) => {
    const question_id = index + 1;
    let rating = null;

    // Determine whether the response is a number or a string
    if (typeof response === 'number' || !isNaN(parseFloat(response))) {
      rating = response.toString(); // Convert numeric values to string
    } else if (typeof response === 'string') {
      rating = response; // Use the string value directly
    } else {
      return res.status(400).json({ error: `Invalid response for question ${question_id}` });
    }

    // Insert the response into the database with customerSessionId
    db.query(sql, [customerSessionId, question_id, rating], (err, result) => {
      if (err) {
        console.error('Error inserting response:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  });

  // Respond with success message after all responses are inserted
  res.status(200).send('Responses submitted successfully');
});




  ///////////////////////////////


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
