// Lab 03 API test list: success and failure cases.
// Usage: start the server on a fresh database (npm start), then run: npm run test:api
// The same list was used to build postman_collection.json.

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const titles = (books) => books.map((b) => b.title);
const ids = (books) => books.map((b) => b.id);
const newBook = { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', price: 550, pages: 352 };

const CASES = [
  // ---- success cases ----
  { name: 'Health check', method: 'GET', path: '/', status: 200 },
  { name: 'List books (defaults)', method: 'GET', path: '/books', status: 200,
    check: (d) => d.length === 10 && d[0].id === 1 },
  { name: 'Search by title (search_q=the)', method: 'GET', path: '/books?search_q=the', status: 200,
    check: (d) => d.length === 2 && d.every((b) => /the/i.test(b.title)) },
  { name: 'Sort by price DESC, limit 3', method: 'GET', path: '/books?order_by=price&order=DESC&limit=3', status: 200,
    check: (d) => titles(d).join() === 'Clean Code,Atomic Habits,Deep Work' },
  { name: 'Pagination (limit=3&offset=3)', method: 'GET', path: '/books?limit=3&offset=3', status: 200,
    check: (d) => ids(d).join() === '4,5,6' },
  { name: 'Price range (min_price=300&max_price=420)', method: 'GET', path: '/books?min_price=300&max_price=420', status: 200,
    check: (d) => d.length === 5 && d.every((b) => b.price >= 300 && b.price <= 420) },
  { name: 'Max price only (max_price=300)', method: 'GET', path: '/books?max_price=300&order_by=price', status: 200,
    check: (d) => titles(d).join() === 'Think and Grow Rich,The Alchemist' },
  { name: 'Get one book', method: 'GET', path: '/books/1', status: 200, check: (d) => d.title === 'Atomic Habits' },
  { name: 'Create book', method: 'POST', path: '/books', status: 201, body: newBook, check: (d) => d.bookId === 11 },
  { name: 'Update book', method: 'PUT', path: '/books/11', status: 200, body: { price: 600 } },
  { name: 'Check update', method: 'GET', path: '/books/11', status: 200, check: (d) => d.price === 600 },
  { name: 'Delete book', method: 'DELETE', path: '/books/11', status: 200 },

  // ---- failure cases ----
  { name: 'Get missing book', method: 'GET', path: '/books/999', status: 404 },
  { name: 'Get with non-numeric id', method: 'GET', path: '/books/abc', status: 400 },
  { name: 'Invalid order_by', method: 'GET', path: '/books?order_by=password', status: 400 },
  { name: 'Invalid order', method: 'GET', path: '/books?order=UP', status: 400 },
  { name: 'Invalid limit', method: 'GET', path: '/books?limit=abc', status: 400 },
  { name: 'min_price greater than max_price', method: 'GET', path: '/books?min_price=500&max_price=100', status: 400 },
  { name: 'Create without title', method: 'POST', path: '/books', status: 400,
    body: { author: 'Someone', price: 100, pages: 50 } },
  { name: 'Create with non-numeric price', method: 'POST', path: '/books', status: 400,
    body: { title: 'Bad Price', author: 'Someone', price: 'abc', pages: 50 } },
  { name: 'Create with invalid JSON', method: 'POST', path: '/books', status: 400, rawBody: '{"title": "oops",' },
  { name: 'Update missing book', method: 'PUT', path: '/books/999', status: 404, body: { price: 100 } },
  { name: 'Update with non-numeric price', method: 'PUT', path: '/books/1', status: 400, body: { price: 'free' } },
  { name: 'Delete already deleted book', method: 'DELETE', path: '/books/11', status: 404 },
  { name: 'Unknown route', method: 'GET', path: '/authors', status: 404 }
];

const send = async ({ method, path, body, rawBody }) => {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  if (rawBody) options.body = rawBody;
  const res = await fetch(`${BASE_URL}${path}`, options);
  return { status: res.status, data: await res.json().catch(() => null) };
};

const run = async () => {
  let failed = 0;
  for (const c of CASES) {
    const { status, data } = await send(c);
    // Every error response must use the same { message } shape.
    const shapeOk = status < 400 || (data && typeof data.message === 'string');
    const ok = status === c.status && shapeOk && (!c.check || c.check(data));
    if (!ok) failed++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.method.padEnd(6)} ${c.path.padEnd(42)} ${status}  ${c.name}`);
    if (!ok) console.log('      got:', JSON.stringify(data));
  }
  console.log(`\n${CASES.length - failed}/${CASES.length} passed`);
  process.exit(failed ? 1 : 0);
};

if (require.main === module) run();

module.exports = { CASES, send };
