# Backend Development Fundamentals - Lab Reports

Comprehensive laboratory experiments, implementations, and documentation for the **Backend Development Fundamentals** course.

---

## Student Information

- **Student Name:** Myadaboina Prasanna Kumar
- **Registration Number:** [YOUR_REGISTRATION_NUMBER]
- **Branch / Section:** [YOUR_SECTION]
- **GitHub Repository:** [Backend_development_fundamentals_lab](https://github.com/prasannakumar0718/Backend_development_fundamentals_lab)

---

## Lab Directory Index

| Lab | Title | Description | Technologies | Report Link |
| :---: | :--- | :--- | :--- | :---: |
| **Lab 01** | **Node.js and Express Server** | Introduction to backend servers using Node.js built-in `http` module and Express.js routing, status codes, and error handling. | Node.js, Express.js | [View Lab 01](./lab-01/) • [Repo](https://github.com/prasannakumar0718/Backend_development_fundamentals_lab_01) • [Live Demo](https://backend-development-fundamentals-lab-01-kt6t.onrender.com) |
| **Lab 02** | **SQLite Database & CRUD Routes** | Relational database modeling, SQL DDL/DML, and RESTful CRUD API endpoints with parameterized queries using SQLite. | Node.js, Express.js, SQLite, sqlite3 | [View Lab 02](./lab-02/) • [Repo](https://github.com/prasannakumar0718/Backend_development_fundamentals_lab_02) • [Live Demo](https://backend-development-fundamentals-lab-02-2oy3.onrender.com) |

---

## Repository Structure

```plaintext
Backend_development_fundamentals_lab/
├── .gitignore
├── README.md
├── lab-01/
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   ├── server-http.js         # Built-in Node http server
│   ├── server.js              # Express application server
│   └── screenshots/           # Endpoint response screenshots
│       ├── home.png
│       ├── about.png
│       ├── time.png
│       └── unknown.png
└── lab-02/
    ├── .gitignore
    ├── package.json
    ├── package-lock.json
    ├── README.md
    ├── init.sql               # SQLite table schema & 10 seed books
    ├── seed.js                # Database seed script
    ├── server.js              # Express server with CRUD API & initializeDBAndServer()
    ├── books.db               # SQLite database file
    ├── postman_collection.json# Postman test collection
    ├── requests.http          # REST client query file
    ├── test-api.js            # Automated endpoint testing script
    └── screenshots/           # CRUD API and database screenshots
        ├── get-all-books.png
        ├── get-single-book.png
        ├── post-book.png
        ├── put-book.png
        ├── delete-book.png
        ├── error-not-found.png
        └── database-records.png
```

---

## General Setup & Installation

Each lab experiment is self-contained within its respective directory. To set up and run any lab:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/prasannakumar0718/Backend_development_fundamentals_lab.git
   cd Backend_development_fundamentals_lab
   ```

2. **Navigate into the desired lab directory:**
   ```bash
   cd lab-01   # or cd lab-02
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the server:**
   - **For Lab 01:**
     ```bash
     npm start           # Express server
     npm run start:http  # Native HTTP server
     ```
   - **For Lab 02:**
     ```bash
     npm run dev         # Development mode with nodemon
     # or: npm start     # Standard node execution
     ```

Refer to the individual `README.md` file in each lab directory for full experiment details, API endpoint specifications, and screenshots.
