const express = require('express');
const fs = require('fs');
const path = require('path');
const basicAuth = require('express-basic-auth');

const app = express();
const PORT = 8000;

// Set up Basic Auth for the admin
const adminAuth = basicAuth({
    users: { 'artist': 'music2026' }, // Username: artist, Password: music2026
    challenge: true,
    realm: 'Artist CMS Dashboard'
});

// Intercept requests to admin files and POST to /api/data to require auth
app.use((req, res, next) => {
    if (req.path.startsWith('/admin') || (req.path === '/api/data' && req.method === 'POST')) {
        return adminAuth(req, res, next);
    }
    next();
});

app.use(express.json());
app.use(express.static(__dirname)); // Serve the static files (index.html, styles.css, etc.)

const dataFilePath = path.join(__dirname, 'data.json');

// GET data
app.get('/api/data', (req, res) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read data' });
        }
        res.json(JSON.parse(data));
    });
});

// POST update data
app.post('/api/data', (req, res) => {
    const newData = req.body;
    fs.writeFile(dataFilePath, JSON.stringify(newData, null, 2), 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save data' });
        }
        res.json({ success: true, message: 'Data updated successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin panel available at http://localhost:${PORT}/admin.html`);
});
