const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5502;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Normalize URL
  let url = req.url;
  if (url === '/') {
    url = '/index.html';
  }

  // Check file extension
  const extname = path.extname(url);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  // File path
  const filePath = path.join(__dirname, url);

  // Read file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        fs.readFile(path.join(__dirname, '404.html'), (err, content) => {
          if (err) {
            // 404 page not found
            res.writeHead(404);
            res.end('404 - Page Not Found');
          } else {
            // Serve 404 page
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/`);
  console.log(`🔮 Genesis Pulse activated! Access http://localhost:${PORT}/whale-tracker-presentation.html`);
}); 