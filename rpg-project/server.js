#!/usr/bin/env node

/**
 * Simple development server for the RPG project
 * Use this when Vite is not available or for simple static serving
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm'
};

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'application/octet-stream';
}

function serveFile(filePath, res) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Internal server error');
            }
            return;
        }

        const mimeType = getMimeType(filePath);
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
    });
}

function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    let filePath = path.join(__dirname, parsedUrl.pathname);

    // Default to index.html for root path
    if (parsedUrl.pathname === '/') {
        filePath = path.join(__dirname, 'index.html');
    }

    // Security check - prevent directory traversal
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    // Check if file exists
    fs.stat(filePath, (err, stats) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Try adding .html extension for clean URLs
                if (!path.extname(filePath)) {
                    filePath += '.html';
                    fs.stat(filePath, (err2, stats2) => {
                        if (err2) {
                            res.writeHead(404);
                            res.end('File not found');
                        } else {
                            serveFile(filePath, res);
                        }
                    });
                } else {
                    res.writeHead(404);
                    res.end('File not found');
                }
            } else {
                res.writeHead(500);
                res.end('Internal server error');
            }
        } else if (stats.isDirectory()) {
            // Serve index.html for directories
            const indexPath = path.join(filePath, 'index.html');
            fs.stat(indexPath, (err, indexStats) => {
                if (err) {
                    res.writeHead(403);
                    res.end('Directory listing not allowed');
                } else {
                    serveFile(indexPath, res);
                }
            });
        } else {
            serveFile(filePath, res);
        }
    });
}

const server = http.createServer(handleRequest);

server.listen(PORT, HOST, () => {
    console.log(`🚀 RPG Development Server running at http://${HOST}:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log(`🎮 Open your browser to start playing the RPG!`);
    console.log(`\nTo stop the server, press Ctrl+C`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down development server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});