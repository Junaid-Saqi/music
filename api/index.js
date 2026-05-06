const express = require('express');
const fs = require('fs');
const path = require('path');
const basicAuth = require('express-basic-auth');

const app = express();

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

// For local dev, serve static files. Vercel ignores this automatically.
app.use(express.static(path.join(__dirname, '..'))); 

const originalDataPath = path.join(__dirname, '..', 'data.json');
const tmpDataPath = '/tmp/data.json'; // Vercel allows writing to /tmp

function getActiveDataPath() {
    if (fs.existsSync(tmpDataPath)) {
        return tmpDataPath;
    }
    return originalDataPath;
}

// GET data
app.get('/api/data', (req, res) => {
    const dataFilePath = getActiveDataPath();
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
    
    // Check if we are running in Vercel (where the root filesystem is read-only)
    const isVercel = process.env.VERCEL === '1';
    const targetPath = isVercel ? tmpDataPath : originalDataPath;

    fs.writeFile(targetPath, JSON.stringify(newData, null, 2), 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save data' });
        }
        res.json({ success: true, message: 'Data updated successfully' });
    });
});

module.exports = app;
