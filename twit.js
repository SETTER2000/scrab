// Найдите количество подписчиков для каждой учетной записи.
// Создает нового всадника для каждого пользователя для более быстрых результатов.
const Horseman = require('node-horseman');
const horseman = new Horseman();
const users = ['PhantomJS',
    'lphpru',
    'ariyahidayat',
    'detronizator',
    'KDABQt',
    'lfranchi',
    'jonleighton',
    '_jamesmgreene',
    'Vitalliumm'];


//.userAgent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36 OPR/58.0.3135.118 222')
horseman
    .userAgent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36 OPR/58.0.3135.118 222')
    .open('file:///D:/crested/lphp.ru/article/399.html')
    // .open('http://www.chinesecrested.no/en/registry/breeders/')
    .click('#sidebar2 > ul > li:nth-child(1) > ul > li:nth-child(1) > span.name_mnogo_blok > a')
    .waitForNextPage({timeout: 5000})
    .text('#zagalovok_par')
    // .text('#sidebar2 > ul > li:nth-child(1) > ul > li:nth-child(1) > span.name_mnogo_blok > a')
    // .attribute()
    // .text('.UserProfileHeader-stat--followers .UserProfileHeader-statCount')
    .then(function(text){
        console.log( text );
    })
    .finally(function(){
        return horseman.close();
    });
/*users.forEach( function( user ){
    const horseman = new Horseman();
    horseman
        //.userAgent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36 OPR/58.0.3135.118 222')
        .open('http://www.chinesecrested.no/en/registry/breeders/')
        .text('#bodycontent > ul > li:nth-child(1) > a')
        // .text('.UserProfileHeader-stat--followers .UserProfileHeader-statCount')
        .then(function(text){
            console.log( user + ': ' + text );
        })
        .finally(function(){
            return horseman.close();
        });
});*/
