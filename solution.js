import express from "express"; 
import bodyParser from "body-parser"; 
import pg from "pg"; 

// Create a new PostgreSQL client
const db = new pg.Client({
  user: "postgres", 
  host: "localhost", 
  database: "World", 
  password: "postgres", 
  port: 5432, 
});

const app = express(); // Create an Express application
const port = 3000; 

db.connect(); // Connect to the PostgreSQL database

// Execute a SQL query to select all rows from the capitals  table
let quiz = [];  // Initialize an empty array to store quiz questions
db.query("SELECT * FROM capitals", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack); // Log any errors that occur during the query
  } else {
    quiz = res.rows; // Store the result of the query in the quiz array
  }
  db.end(); // Close the database connection
});

let totalCorrect = 0; // Initialize the totalCorrect variable to track the number of correct answers

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies (form submissions)
app.use(express.static("public")); // Serve static files from the public directory

let currentQuestion = {}; // Initialize the currentQuestion variable

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0; // Reset the totalCorrect variable
  await nextQuestion(); // Get the next question
  console.log(currentQuestion); // Log the current question to the console
  res.render("index.ejs", { question: currentQuestion }); // Render the index.ejs template with the current question
});

// POST a new post (form submission)
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim(); // Get the submitted answer and trim whitespace
  let isCorrect = false; // Initialize the isCorrect variable to false
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++; // Increment totalCorrect if the answer is correct
    console.log(totalCorrect); // Log the totalCorrect to the console
    isCorrect = true; // Set isCorrect to true
  }

  nextQuestion(); // Get the next question
  res.render("index.ejs", {
    question: currentQuestion, // Pass the current question to the template
    wasCorrect: isCorrect, // Pass whether the previous answer was correct
    totalScore: totalCorrect, // Pass the total score
  });
});

// Function to get the next question
async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)]; // Select a random question from the quiz array
  currentQuestion = randomCountry; // Set the currentQuestion to the selected question
}

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`); // Log the server URL to the console
});
