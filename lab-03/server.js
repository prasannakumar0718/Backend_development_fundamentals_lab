// Lab 03: REST API with query parameters, validation and consistent status codes
// Builds on the Lab 02 book CRUD API.

const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const app = express();
app.use(express.json());

const dbPath = process.env.DB_PATH || path.join(__dirname, 'books.db');
let db = null;

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

// Column names cannot be sent as ? parameters, so order_by is checked against this list.
const SORTABLE_COLUMNS = ['id', 'title', 'author', 'price', 'pages'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const isNumber = (value) =>
  value !== null && value !== '' && typeof value !== 'boolean' && !isNaN(Number(value));

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';

const isValidId = (id) => /^[1-9]\d*$/.test(id);

const findBook = (id) => db.get('SELECT * FROM book WHERE id = ?;', [id]);

// Returns an error message, or null when the body is valid.
// partial = true for PUT, where only the fields that are sent are checked.
const validateBook = (body, partial = false) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object.';
  }
  const { title, author, price, pages } = body;
  const required = partial ? [] : ['title', 'author', 'price', 'pages'];
  const missing = required.filter((field) => body[field] === undefined || body[field] === '');
  if (missing.length) return `Missing required field(s): ${missing.join(', ')}.`;

  if (title !== undefined && !isNonEmptyString(title)) return 'title must be a non-empty string.';
  if (author !== undefined && !isNonEmptyString(author)) return 'author must be a non-empty string.';
  if (price !== undefined && (!isNumber(price) || Number(price) < 0)) {
    return 'price must be a non-negative number.';
  }
  if (pages !== undefined && (!isNumber(pages) || !Number.isInteger(Number(pages)) || Number(pages) <= 0)) {
    return 'pages must be a positive whole number.';
  }
  if (partial && [title, author, price, pages].every((v) => v === undefined)) {
    return 'Send at least one field to update: title, author, price or pages.';
  }
  return null;
};

// Turns the query string of GET /books into SQL + params, or returns { error }.
const buildListQuery = (query) => {
  const {
    search_q = '',
    order_by = 'id',
    order = 'ASC',
    limit = '10',
    offset = '0',
    min_price,
    max_price
  } = query;

  if (typeof search_q !== 'string') return { error: 'search_q must be a single text value.' };
  if (!SORTABLE_COLUMNS.includes(order_by)) {
    return { error: `order_by must be one of: ${SORTABLE_COLUMNS.join(', ')}.` };
  }
  const direction = String(order).toUpperCase();
  if (direction !== 'ASC' && direction !== 'DESC') {
    return { error: 'order must be ASC or DESC.' };
  }
  if (!/^\d+$/.test(limit) || Number(limit) < 1 || Number(limit) > 100) {
    return { error: 'limit must be a whole number between 1 and 100.' };
  }
  if (!/^\d+$/.test(offset)) {
    return { error: 'offset must be a whole number of 0 or more.' };
  }
  if (min_price !== undefined && !isNumber(min_price)) return { error: 'min_price must be a number.' };
  if (max_price !== undefined && !isNumber(max_price)) return { error: 'max_price must be a number.' };
  if (min_price !== undefined && max_price !== undefined && Number(min_price) > Number(max_price)) {
    return { error: 'min_price cannot be greater than max_price.' };
  }

  const conditions = ['title LIKE ?'];
  const params = [`%${search_q}%`];
  if (min_price !== undefined && max_price !== undefined) {
    conditions.push('price BETWEEN ? AND ?');
    params.push(Number(min_price), Number(max_price));
  } else if (min_price !== undefined) {
    conditions.push('price >= ?');
    params.push(Number(min_price));
  } else if (max_price !== undefined) {
    conditions.push('price <= ?');
    params.push(Number(max_price));
  }

  const sql = `
    SELECT *
    FROM book
    WHERE ${conditions.join(' AND ')}
    ORDER BY ${order_by} ${direction}
    LIMIT ? OFFSET ?;
  `;
  params.push(Number(limit), Number(offset));
  return { sql, params };
};

// ---------------------------------------------------------------------------
// Routes: nouns in the path, HTTP method shows the action
// ---------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Book Store API (Lab 03) is running.' });
});

// GET /books?search_q=&order_by=&order=&limit=&offset=&min_price=&max_price=
app.get('/books', async (req, res) => {
  const { sql, params, error } = buildListQuery(req.query);
  if (error) return res.status(400).json({ message: error });

  const books = await db.all(sql, params);
  res.status(200).json(books);
});

app.get('/books/:bookId', async (req, res) => {
  const { bookId } = req.params;
  if (!isValidId(bookId)) return res.status(400).json({ message: 'bookId must be a positive whole number.' });

  const book = await findBook(bookId);
  if (!book) return res.status(404).json({ message: `Book with id ${bookId} not found.` });

  res.status(200).json(book);
});

app.post('/books', async (req, res) => {
  const error = validateBook(req.body);
  if (error) return res.status(400).json({ message: error });

  const { title, author, price, pages } = req.body;
  const result = await db.run(
    'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);',
    [title.trim(), author.trim(), Number(price), Number(pages)]
  );
  res.status(201).json({ message: 'Book created successfully.', bookId: result.lastID });
});

app.put('/books/:bookId', async (req, res) => {
  const { bookId } = req.params;
  if (!isValidId(bookId)) return res.status(400).json({ message: 'bookId must be a positive whole number.' });

  const error = validateBook(req.body, true);
  if (error) return res.status(400).json({ message: error });

  const book = await findBook(bookId);
  if (!book) return res.status(404).json({ message: `Book with id ${bookId} not found.` });

  const { title, author, price, pages } = req.body;
  await db.run(
    'UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;',
    [
      title !== undefined ? title.trim() : book.title,
      author !== undefined ? author.trim() : book.author,
      price !== undefined ? Number(price) : book.price,
      pages !== undefined ? Number(pages) : book.pages,
      bookId
    ]
  );
  res.status(200).json({ message: 'Book updated successfully.' });
});

app.delete('/books/:bookId', async (req, res) => {
  const { bookId } = req.params;
  if (!isValidId(bookId)) return res.status(400).json({ message: 'bookId must be a positive whole number.' });

  const book = await findBook(bookId);
  if (!book) return res.status(404).json({ message: `Book with id ${bookId} not found.` });

  await db.run('DELETE FROM book WHERE id = ?;', [bookId]);
  res.status(200).json({ message: 'Book deleted successfully.' });
});

// Unknown route
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

// Error handler: bad JSON gives 400, anything else 500. Express 5 forwards rejected async handlers here.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON.' });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error.' });
});

// ---------------------------------------------------------------------------
// Start: open DB, create + seed table, then listen
// ---------------------------------------------------------------------------
const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);
    const { count } = await db.get('SELECT COUNT(*) AS count FROM book;');
    if (count === 0) {
      for (const book of initialBooks) {
        await db.run('INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);', book);
      }
      console.log('Database seeded with 10 books.');
    }

    const PORT = process.env.PORT || 3000;
    // Express 5 passes listen errors (e.g. EADDRINUSE) to this callback.
    app.listen(PORT, '0.0.0.0', (err) => {
      if (!err) return console.log(`Server is running at http://localhost:${PORT}/`);
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the other process or set PORT to a free port.`);
      } else {
        console.error(err);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error(`Database Initialization Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

module.exports = app;
