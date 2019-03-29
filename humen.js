const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const resolve = require('url').resolve;
const fs = require('fs');
const URL = 'http://lphp.ru/artpage/50.html';
const results = [];
const q = tress(function(url, callback){
    needle.get(url, function(err, res){

            if (!err && res.statusCode == 200)
                // console.log(res.body);


        // парсим DOM
        const $ = cheerio.load(res.body);

        //информация о новости
        if($('.b_infopost').contents().eq(2).text().trim().slice(0, -1) === 'Алексей Козлов'){
            results.push({
                title: $('h1').text(),
                date: $('.b_infopost>.date').text(),
                href: url,
                size: $('.newsbody').text().length
            });
        }

        //список новостей
        $('#description > a').each(function() {
            q.push($(this).attr('href'));
        });

        //паджинатор
        $('.bpr_next>a').each(function() {
            // не забываем привести относительный адрес ссылки к абсолютному
            q.push(resolve(URL, $(this).attr('href')));
        });

        callback();
    });
}, 10); // запускаем 10 параллельных потоков

q.drain = function(){
    fs.writeFileSync('./data.json', JSON.stringify(results, null, 4));
};

q.push(URL);