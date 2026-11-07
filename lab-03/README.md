# Lab 3: REST API, query parameters, validation, debugging

**Live link:** Not deployed yet. The code is ready for Render: the `backend-development-fundamentals-lab-03` service is in [`render.yaml`](../render.yaml) with root directory `lab-03`. Deploying needs the student's Render login. Until the URL is added here, the screenshots below show every endpoint working locally.

Myadaboina Prasanna Kumar · 252U1R9103 · GENAI-2B

---

## What changed from Lab 2

- Endpoints are nouns (`/books`, `/books/:bookId`). The HTTP method is the action.
- `GET /books` supports search, sorting, pagination and a price range. Every parameter has a default.
- `POST` and `PUT` bodies are validated. Bad input returns `400` with a clear message.
- Status codes: `201` create, `200` read/update/delete, `400` bad input, `404` missing id or route, `500` server error.
- Every error uses the same shape: `{ "message": "..." }`. This includes invalid JSON, unknown routes and crashes.
- All SQL uses `?` placeholders. `order_by` and `order` cannot be placeholders, so they are checked against a fixed list before they go into the SQL.
- Debugging exercise: see [`debugging/README.md`](debugging/README.md).

## How to run

```bash
cd lab-03
npm install
npm start            # or: npm run dev  (nodemon)
```

Environment variables (all optional, no `.env` needed):

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Port to listen on |
| `DB_PATH` | `lab-03/books.db` | SQLite file. It is created and seeded with 10 books on first start |

Run the test list (25 success and failure cases) against a running server with a **fresh** database:

```bash
npm run test:api
```

Postman: import [`postman_collection.json`](postman_collection.json) and run the collection in order. Each request checks its status code, and error requests also check the `message` field. The same requests are in [`requests.http`](requests.http) for the VS Code REST Client.

## Endpoints

| Method | Path | Description | Success | Failure |
|---|---|---|---|---|
| GET | `/` | Health check | 200 | – |
| GET | `/books` | List books with search, sort, pagination and price filter | 200 | 400 bad query parameter |
| GET | `/books/:bookId` | Get one book | 200 | 400 bad id, 404 not found |
| POST | `/books` | Create a book (`title`, `author`, `price`, `pages` required) | 201 | 400 missing/invalid field or bad JSON |
| PUT | `/books/:bookId` | Update the fields that are sent | 200 | 400 invalid field, 404 not found |
| DELETE | `/books/:bookId` | Delete a book | 200 | 400 bad id, 404 not found |
| any | other path | Unknown route | – | 404 |

### Query parameters for `GET /books`

| Parameter | Default | Rule |
|---|---|---|
| `search_q` | `""` | Partial title match: `title LIKE %search_q%` |
| `order_by` | `id` | One of `id, title, author, price, pages` |
| `order` | `ASC` | `ASC` or `DESC` (any letter case) |
| `limit` | `10` | Whole number 1–100 |
| `offset` | `0` | Whole number ≥ 0 |
| `min_price`, `max_price` | none | Numbers. Both given: `price BETWEEN ? AND ?`. One given: `>=` or `<=`. `min_price > max_price` gives 400 |

Example: `GET /books?search_q=the&order_by=price&order=DESC&limit=5&offset=0&min_price=200&max_price=500`

### Error format

```json
{ "message": "price must be a non-negative number." }
```

## Test results

```text
PASS  GET    /                                          200  Health check
PASS  GET    /books                                     200  List books (defaults)
PASS  GET    /books?search_q=the                        200  Search by title (search_q=the)
PASS  GET    /books?order_by=price&order=DESC&limit=3   200  Sort by price DESC, limit 3
PASS  GET    /books?limit=3&offset=3                    200  Pagination (limit=3&offset=3)
PASS  GET    /books?min_price=300&max_price=420         200  Price range (min_price=300&max_price=420)
PASS  GET    /books?max_price=300&order_by=price        200  Max price only (max_price=300)
PASS  GET    /books/1                                   200  Get one book
PASS  POST   /books                                     201  Create book
PASS  PUT    /books/11                                  200  Update book
PASS  GET    /books/11                                  200  Check update
PASS  DELETE /books/11                                  200  Delete book
PASS  GET    /books/999                                 404  Get missing book
PASS  GET    /books/abc                                 400  Get with non-numeric id
PASS  GET    /books?order_by=password                   400  Invalid order_by
PASS  GET    /books?order=UP                            400  Invalid order
PASS  GET    /books?limit=abc                           400  Invalid limit
PASS  GET    /books?min_price=500&max_price=100         400  min_price greater than max_price
PASS  POST   /books                                     400  Create without title
PASS  POST   /books                                     400  Create with non-numeric price
PASS  POST   /books                                     400  Create with invalid JSON
PASS  PUT    /books/999                                 404  Update missing book
PASS  PUT    /books/1                                   400  Update with non-numeric price
PASS  DELETE /books/11                                  404  Delete already deleted book
PASS  GET    /authors                                   404  Unknown route

25/25 passed
```

## Screenshots

These are real responses from the local server, one per test case, in the order of the test list.

### Success cases

![Health check](screenshots/01-health-check.png)
![List books with defaults](screenshots/02-list-books-defaults.png)
![Search by title](screenshots/03-search-by-title-search-q-the.png)
![Sort by price DESC with limit](screenshots/04-sort-by-price-desc-limit-3.png)
![Pagination with limit and offset](screenshots/05-pagination-limit-3-offset-3.png)
![Price range with BETWEEN](screenshots/06-price-range-min-price-300-max-price-420.png)
![Max price only](screenshots/07-max-price-only-max-price-300.png)
![Get one book](screenshots/08-get-one-book.png)
![Create book returns 201](screenshots/09-create-book.png)
![Update book returns 200](screenshots/10-update-book.png)
![Updated book](screenshots/11-check-update.png)
![Delete book returns 200](screenshots/12-delete-book.png)

### Failure cases

![Missing book returns 404](screenshots/13-get-missing-book.png)
![Non-numeric id returns 400](screenshots/14-get-with-non-numeric-id.png)
![Invalid order_by returns 400](screenshots/15-invalid-order-by.png)
![Invalid order returns 400](screenshots/16-invalid-order.png)
![Invalid limit returns 400](screenshots/17-invalid-limit.png)
![min_price greater than max_price returns 400](screenshots/18-min-price-greater-than-max-price.png)
![Missing title returns 400](screenshots/19-create-without-title.png)
![Non-numeric price returns 400](screenshots/20-create-with-non-numeric-price.png)
![Invalid JSON returns 400](screenshots/21-create-with-invalid-json.png)
![Update missing book returns 404](screenshots/22-update-missing-book.png)
![Update with bad price returns 400](screenshots/23-update-with-non-numeric-price.png)
![Delete missing book returns 404](screenshots/24-delete-already-deleted-book.png)
![Unknown route returns 404](screenshots/25-unknown-route.png)

## Notes: problems faced and how I solved them

1. **Sorting cannot use `?` placeholders.** SQLite placeholders only bind values, not column names or `ASC`/`DESC`. I check `order_by` against a fixed list of columns and `order` against `ASC`/`DESC`, then put them in the SQL. User input never reaches the SQL string unchecked.
2. **Port conflict printed "Server is running" and then crashed.** In Express 5, `app.listen` also calls its callback with the error. Now the callback checks `err` and prints a clear `EADDRINUSE` message.
3. **Invalid JSON returned an HTML error page.** I added an error handler that turns `entity.parse.failed` into `400 { "message": "Request body is not valid JSON." }`, so every error has the same format.
4. **A missing `await` returned `200 {}` instead of `404`.** A pending Promise is truthy, so the `if (!book)` check never ran. Every DB call is now awaited. See [`debugging/README.md`](debugging/README.md) for all four debugging fixes.
5. **The tests depend on the database state.** The test list creates, updates and deletes book 11, so it expects a freshly seeded database. For a clean run, delete `books.db` or point `DB_PATH` to a new file.

## Viva answers (short)

- **Query vs path parameter:** a path parameter identifies a resource (`/books/5`). Query parameters filter, sort or page a collection (`/books?order_by=price`).
- **Stateless:** each request carries everything the server needs. The server keeps no client session between requests.
- **Bad input vs missing record:** `400 Bad Request` for invalid input, `404 Not Found` when the id does not exist.
