/**
 * Lab 02 Automated API Test Suite
 * Validates all CRUD endpoints against http://localhost:3000
 * Follows the unified workflow: POST 11 -> GET 11 -> PUT 11 -> DELETE 11
 */

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log(`Starting automated API test suite against ${BASE_URL}...\n`);

  let passed = 0;
  let failed = 0;

  async function testEndpoint(name, method, endpoint, expectedStatus, body = null) {
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (body) {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(`${BASE_URL}${endpoint}`, options);
      const data = await res.json().catch(() => null);

      if (res.status === expectedStatus) {
        console.log(`[PASS] ${name} -> Status: ${res.status}`);
        passed++;
        return data;
      } else {
        console.error(`[FAIL] ${name} -> Expected ${expectedStatus}, got ${res.status}`);
        console.error(`       Response:`, data);
        failed++;
        return null;
      }
    } catch (err) {
      console.error(`[ERROR] ${name}: Request failed (${err.message})`);
      failed++;
      return null;
    }
  }

  // 1. GET /books/ (Retrieve all 10 books)
  const allBooks = await testEndpoint('1. GET /books/ (Retrieve all books)', 'GET', '/books/', 200);
  console.log(`       Initial count: ${allBooks ? allBooks.length : 0} books.`);

  // 2. GET /books/1/ (Retrieve single existing book by ID)
  const singleBook = await testEndpoint('2. GET /books/1/ (Retrieve single book by ID)', 'GET', '/books/1/', 200);
  if (singleBook) {
    console.log(`       Book 1: "${singleBook.title}" by ${singleBook.author}`);
  }

  // 3. POST /books/ (Add new book -> ID 11)
  const newBookPayload = {
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt & David Thomas',
    price: 550,
    pages: 352
  };
  const postRes = await testEndpoint('3. POST /books/ (Add new book)', 'POST', '/books/', 201, newBookPayload);
  const createdBookId = postRes ? postRes.bookId : 11;
  console.log(`       Created book with ID: ${createdBookId}`);

  // 4. GET /books/11/ (Verify created book)
  await testEndpoint(`4. GET /books/${createdBookId}/ (Verify created book)`, 'GET', `/books/${createdBookId}/`, 200);

  // 5. PUT /books/11/ (Update the same created book)
  const updatePayload = {
    title: 'The Pragmatic Programmer (20th Anniversary Edition)',
    author: 'David Thomas & Andrew Hunt',
    price: 600,
    pages: 360
  };
  await testEndpoint(`5. PUT /books/${createdBookId}/ (Update book ID ${createdBookId})`, 'PUT', `/books/${createdBookId}/`, 200, updatePayload);

  // 6. DELETE /books/11/ (Delete the same created book)
  await testEndpoint(`6. DELETE /books/${createdBookId}/ (Delete book ID ${createdBookId})`, 'DELETE', `/books/${createdBookId}/`, 200);

  // 7. GET /books/11/ (Verify deleted -> 404 Not Found)
  await testEndpoint(`7. GET /books/${createdBookId}/ (Verify deleted -> 404)`, 'GET', `/books/${createdBookId}/`, 404);

  // 8. GET /books/999/ (Nonexistent book -> 404 Not Found)
  await testEndpoint('8. GET /books/999/ (Nonexistent book -> 404)', 'GET', '/books/999/', 404);

  // 9. GET /books/abc/ (Invalid ID -> 400 Bad Request)
  await testEndpoint('9. GET /books/abc/ (Invalid ID -> 400)', 'GET', '/books/abc/', 400);

  // 10. DELETE /books/999/ (Delete nonexistent book -> 404 Not Found)
  await testEndpoint('10. DELETE /books/999/ (Delete nonexistent -> 404)', 'DELETE', '/books/999/', 404);

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
