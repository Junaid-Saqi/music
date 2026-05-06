const app = require('./api/index');

const PORT = 8000;

app.listen(PORT, () => {
    console.log(`Server running locally at http://localhost:${PORT}`);
    console.log(`Admin panel available at http://localhost:${PORT}/admin/index.html`);
});
