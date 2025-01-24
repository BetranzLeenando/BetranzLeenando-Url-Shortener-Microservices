require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Database sementara
const urlDatabase = [];
let idCounter = 1; // Counter untuk menghasilkan short_url unik

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true })); // Parsing form-urlencoded
app.use(express.json()); // Parsing JSON

// Konfigurasi port
const port = process.env.PORT || 3000;

// Serve file statis dan halaman utama
app.use('/public', express.static(`${process.cwd()}/public`));
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Fungsi untuk memvalidasi URL menggunakan dns.lookup
const isValidUrl = (url, callback) => {
  try {
    const hostname = new URL(url).hostname; // Ekstrak hostname dari URL
    dns.lookup(hostname, (err) => {
      callback(!err); // Jika tidak ada error, hostname valid
    });
  } catch (e) {
    callback(false); // Format URL salah
  }
};

// Endpoint untuk membuat short URL
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;

  // Validasi URL dengan dns.lookup
  isValidUrl(url, (isValid) => {
    if (!isValid) {
      return res.json({ error: 'invalid url' });
    }

    // Simpan URL dalam database sementara
    const newUrlEntry = {
      original_url: url,
      short_url: idCounter,
    };
    urlDatabase.push(newUrlEntry);
    idCounter += 1;

    // Berikan respon JSON
    res.json(newUrlEntry);
  });
});

// Endpoint untuk redirect berdasarkan short_url
app.get('/api/shorturl/:short_url', (req, res) => {
  const { short_url } = req.params;
  const urlEntry = urlDatabase.find((entry) => entry.short_url === parseInt(short_url));

  if (!urlEntry) {
    return res.status(404).json({ error: 'No URL found for the given short_url' });
  }

  // Redirect ke URL asli
  res.redirect(urlEntry.original_url);
});

// Jalankan server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
