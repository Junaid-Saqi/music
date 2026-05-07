const express = require('express');
const fs = require('fs');
const path = require('path');
const basicAuth = require('express-basic-auth');
const { kv } = require('@vercel/kv');
require('dotenv').config();

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

// Serve static files
const rootDir = path.join(__dirname, '..');
app.use(express.static(rootDir));

// Root route - serve index.html explicitly if static doesn't catch it
app.get('/', (req, res) => {
    res.sendFile(path.join(rootDir, 'index.html'));
});
const originalDataPath = path.join(__dirname, '..', 'data.json');
const tmpDataPath = '/tmp/data.json'; // Vercel allows writing to /tmp

function getActiveDataPath() {
    if (fs.existsSync(tmpDataPath)) {
        return tmpDataPath;
    }
    return originalDataPath;
}

// GET data
app.get('/api/data', async (req, res) => {
    try {
        // Try to get data from Cloud Storage (Vercel KV)
        if (process.env.KV_REST_API_URL) {
            const cloudData = await kv.get('artist_data');
            if (cloudData) {
                return res.json(cloudData);
            }
        }

        // Fallback to local file if cloud is not configured or empty
        const dataFilePath = getActiveDataPath();
        fs.readFile(dataFilePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to read data' });
            }
            res.json(JSON.parse(data));
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST update data
app.post('/api/data', async (req, res) => {
    const newData = req.body;
    
    try {
        // 1. Save to Cloud Storage (Vercel KV) if configured
        if (process.env.KV_REST_API_URL) {
            await kv.set('artist_data', newData);
        }

        // 2. Save to local file (for local dev or Vercel /tmp fallback)
        const isVercel = process.env.VERCEL === '1';
        const targetPath = isVercel ? tmpDataPath : originalDataPath;

        fs.writeFile(targetPath, JSON.stringify(newData, null, 2), 'utf8', (err) => {
            if (err) {
                // If cloud saved but file failed, we still count it as a partial success
                if (!process.env.KV_REST_API_URL) {
                    return res.status(500).json({ error: 'Failed to save data' });
                }
            }
            res.json({ 
                success: true, 
                message: 'Data updated successfully',
                storage: process.env.KV_REST_API_URL ? 'cloud' : 'local'
            });
        });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: 'Failed to save to cloud storage' });
    }
});

module.exports = app;
