# Debugging exercise

`broken/` is a small copy of the API with four bugs, the same four the faculty's broken version contains.
Each bug is marked with a `// BUG n` comment. The error output below comes from running it.

| # | Symptom (real output) | Cause | Fix |
|---|---|---|---|
| 1 | `Error: listen EADDRINUSE: address already in use 0.0.0.0:3000` | Another server (e.g. Lab 2) already listens on port 3000 and the port is hard-coded. | Stop the other process (`netstat -ano \| findstr :3000`, then `taskkill /PID <pid> /F`), or start on another port: `PORT=3001 npm start`. `server.js` reads `process.env.PORT` and prints a clear message instead of a stack trace. |
| 2 | `Error: Cannot find module './database'` (`code: 'MODULE_NOT_FOUND'`) | `require('./database')` but the file is `db.js`. | `require('./db')`. Relative paths are resolved from the file that calls `require`. |
| 3 | `GET /books` → `500`, log shows `SQLITE_ERROR: no such table: books` | Table name typo: the table is `book`. | `SELECT * FROM book;`. Check the real name with `sqlite3 books.db ".tables"`. |
| 4 | `GET /books/999` → `200 {}` instead of `404`; `GET /books/1` also returns `{}` | `db.get(...)` without `await` returns a Promise. A Promise is truthy, so the 404 check never runs, and it serializes to `{}`. | `const book = await db.get(...)`. |

## How the fixed code avoids each one

- Port: `const PORT = process.env.PORT || 3000;` and the `app.listen` callback handles `EADDRINUSE`.
- Import path: the working `server.js` has no local imports. When you split files, run `node server.js` once after each move.
- Table name: the same `book` name is used in `CREATE TABLE` and in every query.
- Await: every `db.get / db.all / db.run` call is awaited inside an `async` handler. Express 5 sends rejected handlers to the error middleware, which returns `500 { "message": "Internal server error." }`.

## Reproduce

```bash
cd lab-03
node debugging/broken/server.js        # bug 2: MODULE_NOT_FOUND
# fix the require, then start it while `npm start` is running → bug 1: EADDRINUSE
# change the port, then: curl localhost:3001/books (bug 3) and curl localhost:3001/books/999 (bug 4)
```
