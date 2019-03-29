const HttpsProxyAgent = require('https-proxy-agent');
require('isomorphic-fetch');

// Попытка получить исходный сервер, но прокси через прокси-сервер ... работает в браузере,
// но не в CLI
// с `node fetch.js`
fetch('http://localhost:8818', {
    agent: new HttpsProxyAgent('http://username:password@localhost:9818')
}).then((res) => {
    console.log('Fetch response', res);
}).catch((err) => {
    console.error('Fetch error', err);
});