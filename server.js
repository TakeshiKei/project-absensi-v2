const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 5000;

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

app.use(cors());
app.use(express.json());

pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected to MySQL Database...");
    connection.release();
});

app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
});


//mengambil data pada upt_dinas
app.get("/api/dataUpt", (req, res) => {
  const sql = "SELECT * FROM upt_dinas";
  pool.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: "Terjadi kesalahan saat mengambil data." });
      return;
    }

    // Modify each row by adding a new property "isChecked" based on the absensi value
    const data = result.map((row) => ({
      ...row,
      isChecked: row.absensi === "Hadir",
    }));

    res.json(data);
  });
});


//menambahkan data pada upt_dinas
app.get("/api/dataUpt", (req, res) => {
    const { nama_upt, absensi} = req.body;
    const sql = `INSERT INTO upt_dinas (id_upt, nama_upt, absensi) VALUES ('', '${nama_upt}', '${absensi}')`;
    pool.query(sql, (err, result) => {
        if (err) throw err;
        res.json({ message: 'Data berhasil ditambahkan.'});
    });
});

// Updating data in upt_dinas based on checkbox selection
app.post("/api/updateDataUpt", (req, res) => {
  const { selectedRows } = req.body;

  // Map through the selected rows and update the absensi field based on the checkbox selection
  const updatePromises = selectedRows.map((rowId) => {
    const absensi = rowId ? "Hadir" : "Tidak Hadir";
    return new Promise((resolve, reject) => {
      const sql = `UPDATE upt_dinas SET absensi = ? WHERE id_upt = ?`;
      pool.query(sql, [absensi, rowId], (err, result) => {
        if (err) reject(err);
        resolve();
      });
    });
  });

  // Execute all update promises
  Promise.all(updatePromises)
    .then(() => {
      res.json({ message: "Data berhasil diperbarui." });
    })
    .catch((err) => {
      console.error("Error updating data:", err);
      res.status(500).json({ message: "Terjadi kesalahan saat memperbarui data." });
    });
});

// Update dataUpt with the provided ID
app.put("/api/dataUpt/:id", (req, res) => {
  const { id } = req.params;
  const { absensi } = req.body;

  console.log("absensi value:", absensi); // Log the value of absensi

  const sql = `UPDATE upt_dinas SET absensi = '${absensi}' WHERE id_upt = ${id}`;
  pool.query(sql, (err, result) => {
    if (err) throw err;
    res.json({ message: "Data berhasil diperbarui." });
  });
});

// Add a new route for handling the search request
app.get("/api/dataUpt/search", (req, res) => {
  const searchTerm = req.query.q; // Get the search query parameter from the request
  // Modify your database query to include the search term
  const sql = "SELECT * FROM upt_dinas WHERE nama_upt LIKE ? OR id_upt LIKE ?";
  const searchValue = `%${searchTerm}%`;
  pool.query(sql, [searchValue, searchValue], (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// mengambil data pada Activity
app.get("/api/dataAct", (req, res) => {
  const sql = "SELECT * FROM kegiatan";
  pool.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Memperbarui data qna
app.put("/api/dataAct", (req, res) => {
  const { nama_kegiatan } = req.body;
  const sql = "UPDATE kegiatan SET nama_kegiatan = ?";
  pool.query(sql, [nama_kegiatan], (err, result) => {
    if (err) throw err;
    res.json({ message: "Data berhasil diperbarui." });
  });
});
