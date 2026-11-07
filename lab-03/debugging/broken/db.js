// Part of the deliberately broken project for the debugging exercise (see ../README.md).
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const connect = () =>
  open({ filename: process.env.DB_PATH || path.join(__dirname, '..', '..', 'books.db'), driver: sqlite3.Database });

module.exports = { connect };
