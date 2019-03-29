const http = require('http');
const httpProxy = require('http-proxy');
const base = 'http://localhost:8818';
const baseProxy = 'http://localhost:9818';
// Create origin server at localhost:8818
server = http.createServer(async (req, res) => {
    console.log('Server received', req.url);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify({ 'a': 'b' }));
    res.end();
});

server.on('error', (err) => {
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });

    res.end('Something went wrong.');
});

server.listen(8818, () => {
    console.log('Origin server is listening for: %s',base); });

// Create proxy server at localhost:9818 pointing to localhost:8818
proxy = httpProxy.createProxyServer({ target: base}).listen(9818, () => {
    console.log('Proxy server is listening for: %s', baseProxy);
});

proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });

    res.end('Something went wrong.');
});