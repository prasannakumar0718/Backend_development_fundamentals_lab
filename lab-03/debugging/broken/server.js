// DELIBERATELY BROKEN - debugging exercise. Each bug is marked; fixes are in ../README.md.
const express = require('express');
const { connect } = require('./database'); // BUG 2: wrong import path, the file is ./db.js

const app = express();
let db;

app.get('/books', async (req, res) => {
  const books = await db.all('SELECT * FROM books;'); // BUG 3: table is called "book"
  res.json(books);
});

app.get('/books/:bookId', async (req, res) => {
  const book = db.get('SELECT * FROM book WHERE id = ?;', [req.params.bookId]); // BUG 4: missing await
  if (!book) return res.status(404).json({ message: 'Book not found.' });
  res.json(book);
});

const start = async () => {
  db = await connect();
  app.listen(3000, '0.0.0.0', (err) => { // BUG 1: hard-coded port, crashes with EADDRINUSE when 3000 is busy
    if (err) throw err;
    console.log('Server running on 3000');
  });
};
start();
