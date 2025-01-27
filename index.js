require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

const urlDatabase = [];
let idCounter = 1; 

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

const port = process.env.PORT || 3000;

app.use('/public', express.static(`${process.cwd()}/public`));
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

const isValidUrl = (url, callback) => {
  try {
    const hostname = new URL(url).hostname;
    dns.lookup(hostname, (err) => {
      callback(!err);
    });
  } catch (e) {
    callback(false);
  }
};
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;
  isValidUrl(url, (isValid) => {
    if (!isValid) {
      return res.json({ error: 'invalid url' });
    }

    const newUrlEntry = {
      original_url: url,
      short_url: idCounter,
    };
    urlDatabase.push(newUrlEntry);
    idCounter += 1;

    res.json(newUrlEntry);
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const { short_url } = req.params;
  const urlEntry = urlDatabase.find((entry) => entry.short_url === parseInt(short_url));

  if (!urlEntry) {
    return res.status(404).json({ error: 'No URL found for the given short_url' });
  }

  res.redirect(urlEntry.original_url);
});
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
