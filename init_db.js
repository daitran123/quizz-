const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("../Quizz_web/quizz.sqlite");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer TEXT NOT NULL
  )`);

  db.run("INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)", ["admin", "123"]);

  db.run(`INSERT INTO questions (question, option_a, option_b, option_c, option_d, correct_answer) VALUES
    ('Thủ đô của Việt Nam là gì?', 'Hà Nội', 'Hải Phòng', 'Hồ Chí Minh', 'Đà Nẵng', 'A'),
    ('2 + 2 = ?', '3', '4', '5', '6', 'B'),
    ('Ngôn ngữ nào chạy trên trình duyệt?', 'Python', 'Java', 'C++', 'JavaScript', 'D')
  `);
});

db.close();
console.log("✅ Database quizz.sqlite đã được khởi tạo xong!");
