# Backend Development Fundamentals - Lab Reports

Comprehensive laboratory experiments, implementations, and documentation for the **Backend Development Fundamentals** course.

---

## Student Information

- **Student Name:** [YOUR_NAME]
- **Registration Number:** [YOUR_REGISTRATION_NUMBER]
- **Branch / Section:** [YOUR_SECTION]
- **GitHub Repository:** [Backend_development_fundamentals_lab](https://github.com/prasannakumar0718/Backend_development_fundamentals_lab)

---

## Lab Directory Index

| Lab | Title | Description | Technologies | Report Link |
| :---: | :--- | :--- | :--- | :---: |
| **Lab 01** | **Node.js and Express Server** | Introduction to backend servers using Node.js built-in `http` module and Express.js routing, status codes, and error handling. | Node.js, Express.js | [View Lab 01](./lab-01/) |

---

## Repository Structure

```plaintext
Backend_development_fundamentals_lab/
├── .gitignore
├── README.md
└── lab-01/
    ├── .gitignore
    ├── package.json
    ├── package-lock.json
    ├── README.md
    ├── server-http.js         # Built-in Node http server
    ├── server.js              # Express application server
    └── screenshots/           # Endpoint response screenshots
        ├── home.png
        ├── about.png
        ├── time.png
        └── unknown.png
```

---

## General Setup & Installation

Each lab experiment is self-contained within its respective directory. To set up and run Lab 01:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/prasannakumar0718/Backend_development_fundamentals_lab.git
   cd Backend_development_fundamentals_lab
   ```

2. **Navigate into the desired lab directory:**
   ```bash
   cd lab-01
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the server:**
   - **For Express server:**
     ```bash
     npm start
     ```
   - **For native HTTP server:**
     ```bash
     npm run start:http
     ```

Refer to the individual `README.md` file in the `lab-01/` directory for full experiment details, API endpoint specifications, and screenshots.
