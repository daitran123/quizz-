const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");

const app = express();
const db = new sqlite3.Database(path.join(__dirname, "quizz.sqlite"));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.static(path.join(__dirname, "PAGE")));

function isAuthenticated(req, res, next) {
  if (req.session.admin) return next();
  res.status(401).json({ error: "Unauthorized" });
}

// LOGIN
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM admins WHERE username=? AND password=?", [username, password], (err, row) => {
    if (row) {
      req.session.admin = row;
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
    }
  });
});

// LOGOUT
app.post("/api/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get("/api/questions", (req, res) => {
  db.all("SELECT * FROM questions", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});
// ADMIN CRUD
app.get("/api/admin/questions", isAuthenticated, (req, res) => {
  db.all("SELECT * FROM questions", (err, rows) => res.json(rows));
});

app.post("/api/admin/questions", isAuthenticated, (req, res) => {
  const { question, option_a, option_b, option_c, option_d, correct_answer } = req.body;
  db.run("INSERT INTO questions (question, option_a, option_b, option_c, option_d, correct_answer) VALUES (?,?,?,?,?,?)", [question, option_a, option_b, option_c, option_d, correct_answer], function (err) {
    res.json({ id: this.lastID });
  });
});

app.put("/api/admin/questions/:id", isAuthenticated, (req, res) => {
  const { id } = req.params;
  const { question, option_a, option_b, option_c, option_d, correct_answer } = req.body;
  db.run("UPDATE questions SET question=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_answer=? WHERE id=?", [question, option_a, option_b, option_c, option_d, correct_answer, id], function (err) {
    res.json({ changes: this.changes });
  });
});

app.delete("/api/admin/questions/:id", isAuthenticated, (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM questions WHERE id=?", [id], function (err) {
    res.json({ changes: this.changes });
  });
});

// USER submit quiz
app.post("/api/submit", (req, res) => {
  const answers = req.body; // { q1: 'A', q2: 'B', ... }
  db.all("SELECT id, correct_answer FROM questions", (err, rows) => {
    let score = 0;
    rows.forEach((q) => {
      if (answers["q" + q.id] && answers["q" + q.id] === q.correct_answer) {
        score++;
      }
    });
    res.json({ score, total: rows.length });
  });
});

// START SERVER
app.listen(3000, () => {
  console.log("Server chạy tại http://localhost:3000");
});
