// Lab 02: SQLite Database and Express CRUD Routes
// Clean, beginner-friendly implementation with SQL injection protection
// Compatible with both local development and Render Cloud deployment

const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

// Initialize the Express application
const app = express();

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Database file path: supports process.env.DB_PATH and defaults to 'books.db' via __dirname
const dbPath = process.env.DB_PATH || path.join(__dirname, 'books.db');
let db = null;

// Initial 10 books dataset used for first-time database provisioning
const initialBooks = [
  ['Atomic Habits', 'James Clear', 499, 320],
  ['The Alchemist', 'Paulo Coelho', 299, 208],
  ['Wings of Fire', 'A.P.J. Abdul Kalam', 350, 180],
  ['Deep Work', 'Cal Newport', 450, 304],
  ['Rich Dad Poor Dad', 'Robert Kiyosaki', 399, 336],
  ['Ikigai', 'Hector Garcia', 320, 208],
  ['Think and Grow Rich', 'Napoleon Hill', 250, 238],
  ['The Power of Habit', 'Charles Duhigg', 420, 371],
  ['Zero to One', 'Peter Thiel', 400, 224],
  ['Clean Code', 'Robert C. Martin', 850, 464]
];

// =========================================================================
// PHASE 4: Database Connection & Server Initialization Function
// =========================================================================
const initializeDBAndServer = async () => {
  try {
    // 1. Open SQLite database using sqlite3 driver
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // 2. Ensure the 'book' table exists with the required schema
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);

    // 3. Auto-seed initial 10 records ONLY if the table is completely empty
    // (Never resets existing database or drops user data on normal start)
    const countRow = await db.get('SELECT COUNT(*) AS count FROM book;');
    if (countRow && countRow.count === 0) {
      const insertQuery = `
        INSERT INTO book (title, author, price, pages)
        VALUES (?, ?, ?, ?);
      `;
      for (const book of initialBooks) {
        await db.run(insertQuery, book);
      }
      console.log('Database initialized with 10 seed records.');
    }

    // 4. Start Express server only AFTER database connection and schema are ready
    // Supports Render's dynamic process.env.PORT and binds to 0.0.0.0
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running at http://0.0.0.0:${PORT}/`);
    });
  } catch (error) {
    // 5. Handle database connection and startup errors properly
    console.error(`Database Initialization Error: ${error.message}`);
    process.exit(1);
  }
};

// Start the database and server
initializeDBAndServer();

// =========================================================================
// ROOT ROUTE
// =========================================================================
app.get('/', (req, res) => {
  res.status(200).send('Book Store API is running.');
});

// =========================================================================
// CRUD API ROUTES
// =========================================================================

// Route 1: GET /books/ - Retrieve all books
app.get(['/books/', '/books'], async (req, res) => {
  try {
    const getBooksQuery = `
      SELECT *
      FROM book
      ORDER BY id ASC;
    `;
    const books = await db.all(getBooksQuery);
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route 2: GET /books/:bookId/ - Retrieve a single book by ID
app.get(['/books/:bookId/', '/books/:bookId'], async (req, res) => {
  try {
    const { bookId } = req.params;

    // Validate ID format (must be numeric)
    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'Invalid book ID. ID must be a numeric value.' });
    }

    // Parameterized query (? placeholder) protects against SQL injection
    const getBookQuery = `
      SELECT *
      FROM book
      WHERE id = ?;
    `;
    const book = await db.get(getBookQuery, [bookId]);

    // Handle book not found
    if (!book) {
      return res.status(404).json({ error: 'Book Not Found' });
    }

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route 3: POST /books/ - Add a new book
app.post(['/books/', '/books'], async (req, res) => {
  try {
    const { title, author, price, pages } = req.body;

    // Validate input presence
    if (!title || !author || price === undefined || pages === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: title, author, price, and pages are required.'
      });
    }

    // Validate data types
    if (isNaN(Number(price)) || isNaN(Number(pages))) {
      return res.status(400).json({
        error: 'Invalid field types: price and pages must be numbers.'
      });
    }

    // Parameterized query (? placeholders) for safe insertion
    const addBookQuery = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;
    const dbResponse = await db.run(addBookQuery, [title, author, Number(price), Number(pages)]);

    res.status(201).json({
      message: 'Book Successfully Added',
      bookId: dbResponse.lastID
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route 4: PUT /books/:bookId/ - Update details of an existing book
app.put(['/books/:bookId/', '/books/:bookId'], async (req, res) => {
  try {
    const { bookId } = req.params;
    const { title, author, price, pages } = req.body;

    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'Invalid book ID. ID must be a numeric value.' });
    }

    // Check if the book exists first
    const checkQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkQuery, [bookId]);

    if (!existingBook) {
      return res.status(404).json({ error: 'Book Not Found' });
    }

    // Use updated values if provided, or retain existing values
    const updatedTitle = title !== undefined ? title : existingBook.title;
    const updatedAuthor = author !== undefined ? author : existingBook.author;
    const updatedPrice = price !== undefined ? Number(price) : existingBook.price;
    const updatedPages = pages !== undefined ? Number(pages) : existingBook.pages;

    // Parameterized UPDATE query (? placeholders)
    const updateBookQuery = `
      UPDATE book
      SET
        title = ?,
        author = ?,
        price = ?,
        pages = ?
      WHERE id = ?;
    `;
    await db.run(updateBookQuery, [
      updatedTitle,
      updatedAuthor,
      updatedPrice,
      updatedPages,
      bookId
    ]);

    res.status(200).json({ message: 'Book Details Updated Successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route 5: DELETE /books/:bookId/ - Delete a book by ID
app.delete(['/books/:bookId/', '/books/:bookId'], async (req, res) => {
  try {
    const { bookId } = req.params;

    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'Invalid book ID. ID must be a numeric value.' });
    }

    // Check if the book exists first
    const checkQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkQuery, [bookId]);

    if (!existingBook) {
      return res.status(404).json({ error: 'Book Not Found' });
    }

    // Parameterized DELETE query (? placeholder)
    const deleteBookQuery = `
      DELETE FROM book
      WHERE id = ?;
    `;
    await db.run(deleteBookQuery, [bookId]);

    res.status(200).json({ message: 'Book Deleted Successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Catch-all handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: '404 - Endpoint Not Found' });
});

module.exports = app;
