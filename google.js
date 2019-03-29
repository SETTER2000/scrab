const Horseman = require('node-horseman');
const horseman = new Horseman();

horseman
    .userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0')
    .open('http://www.google.com')
    .type('input[name="q"]', 'github')
    .click('[name="btnK"]')
    .keyboardEvent('keypress', 16777221)
    .waitForSelector('div.g')
    .count('div.g')
    .log() // prints out the number of results
    .close();