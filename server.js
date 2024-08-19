'use strict';
const http = require('http');
const fs = require('fs');
const screenshot = require('desktop-screenshot');
const port = process.env.PORT || 1337;

http.createServer(function (req, res) {
    if (req.url === '/capture') {
        screenshot("screenshot.png", function (error, complete) {
            if (error) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Screenshot failed: ' + error.message);
            } else {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Screenshot succeeded');
                uploadToPC("screenshot.png");
            }
        });
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Hello World\n');
    }
}).listen(port);

function uploadToPC(filePath) {
    const boundary = '--------------------------' + Date.now().toString(16);
    const options = {
        hostname: '192.168.88.18',  // La IP de tu PC en la red
        port: 3000,                 // El puerto en el que corre el servidor en tu PC
        path: '/',
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data; boundary=' + boundary,
        },
    };

    const req = http.request(options, (res) => {
        res.on('data', (chunk) => {
            console.log(`Response: ${chunk}`);
        });
    });

    const fileStream = fs.createReadStream(filePath);
    req.write('--' + boundary + '\r\n');
    req.write('Content-Disposition: form-data; name="file"; filename="screenshot.png"\r\n');
    req.write('Content-Type: image/png\r\n\r\n');
    fileStream.pipe(req, { end: false });

    fileStream.on('end', () => {
        req.end('\r\n--' + boundary + '--\r\n');
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });
}
