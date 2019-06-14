const osmosis = require('osmosis');
const url = require('url');
const fs = require('fs');
// const domain = 'file:///D:/crested/www.chinesecrested.no/en/registry/breeders/default.htm';
const urlRegistry = 'http://www.chinesecrested.no/en/registry/';
const domain = 'http://www.chinesecrested.no/en/registry/breeders/';
const urlOwner = 'http://www.chinesecrested.no/en/registry/owners/';

let ken = '';
let country = `${domain}${ken}default.htm`;

// Сделайте пользовательский агент браузером (Google Chrome в Windows)
osmosis.config('user_agent', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36 OPR/58.0.3135.118 222');
// Если запрос не выполнен, не продолжайте повторную попытку (по умолчанию это 3)
osmosis.config('tries', 3);
// Параллельные запросы (по умолчанию это 5) делают это 2, поэтому мы не забиваем сайт
osmosis.config('concurrency', 2);
osmosis.config('follow_set_cookies', true);
osmosis.config('follow_set_referer', true);
osmosis.config('follow', 10);

// return;
/*function getOwners(res) {
    return new Promise((resolve, reject) => {
        let list = [];
        osmosis
        // Поиск на странице стран
            .get(res)
            .find('#kennelmenu >li>a')
            .follow('@href')
            .find('#ownerListing > li')
            .set({
                'nameDog': 'ul>li[1]>a>strong',
                'nic': 'ul>li[2]>strong',
                'urlDog': 'a@href',
                'img': 'a > img@src',
                'type': 'ul>li[3]',
                'statistics': 'ul>li[4]>a',
                'pedigree': 'ul>li[4]>a@href',
            })
            .data(data => list.push(data))
            .error(err => reject(err))
            .done(() => resolve(list));
    });
}*/
function getOwners(res) {
    console.log('Функция getOwners. Сюда должны подключиться: ', res);
    return new Promise((resolve, reject) => {
        let list = [];
        osmosis
            .get(res)
            .find('//*[@id="kennelmenu"]/li[1]/a')
            // .follow('@href')
            .set('href')
            //
            .find('#ownerListing > li')
            .set({
                'nameDog': 'ul>li[1]>a>strong',
                'nic': 'ul>li>strong',
                'main': 'a@href', // Ссылка на главную страницу собаки
                'img': 'a > img@src',
                'type': 'ul>li/text()',
                'statistics': 'ul>li[4]>a',
                'pedigree': 'ul>li[4]>a@href',
            })
            .then(async (context, data) => {
                console.log(data);
            })
            .delay(5000)
            .data(item => list.push(item))
            .error(err => reject(err + ' ' + res))
            .done(() => resolve(list));
    });
}

function getLitters(res) {
    return new Promise((resolve, reject) => {
        let list = [];
        console.log('Функция getLitters. Сюда должны подключиться: ', res);
        osmosis
        // Поиск на странице стран
            .get(res)
            .find('#breedingListing > li')
            .set({
                'litterBorn': 'dl>dd[1]',
                'sire': 'dl>dd[2]>a/text()',
                'dam': 'dl>dd[3]>a/text()',
                'sireUrl': 'dl>dd[2]>a@href',
                'damUrl': 'dl>dd[3]>a@href',
            }).then(data => {
            // console.log('sireUrl', data);
            })
            .data(data => list.push(data))

            .error(err => reject(err))
            .done(() => resolve(list))
        ;
    });
}

function getKennels(res) {
    console.log('Функция getKennels. Сюда должны подключиться: ', res);
    return new Promise((resolve, reject) => {
        let releasesMap = [];
        let notConnect = [];
        osmosis
        // Поиск на странице стран
            .get(res)
            .find('#bodycontent > ul.linkList > li')
            .set({
                'name': 'a/text()',
                'total': 'a>span',
                'url': 'a@href',
                'litters': 'p',
                'owners': 'p',
            })
            // .do((context, data)=>{
            //     console.log(data);
            //
            // })
            // .follow('@href')
            // .find('h1')
            // .set({'breeder':'span[2]'})
            .then(async (context, data) => {
                console.log(data);
                // context.find('a[href]')
                //     .set({
                //         'h1': 'h1/text()',
                //         'breeder':'h1>span[2]'
                //     })
            })
            // .delay(3000)
            .then(async (context, data) => {
                let v;
                try {
                    let arrUrl = res.split('/').slice(-2); //arrUrl::  [ 'Argentina', 'default.htm' ]
                    // console.log('arrUrl:: ' , arrUrl);
                    let url = `${domain}${arrUrl[0]}/${data.url}`;
                    data.litters = await getLitters(url);
                } catch (e) {
                    v = await  console.log('getLitters Не смог подключиться:', e); // Ошибка!
                }
            })
            .then(async (context, data) => {
                let v;
                try {
                    let arrUrl = res.split('/').slice(-2); //arrUrl::  [ 'Argentina', 'default.htm' ]
                    // console.log('arrUrl:: ' , arrUrl);
                    let url =  `${urlOwner}${arrUrl[0]}/${data.url}`;
                    data.owners = await getOwners(url);
                } catch (e) {
                    if (e.indexOf("(find) no results for") >= 0) {
                        v = await   console.log(`getOwners Не нашёл owner: ${url}`, e);
                    } else if (e.indexOf('404 Not Found') >= 0) {
                        v = await   console.log(`getOwners Страница не найдена:`, e);}
                        else if (e.indexOf('403 Forbidden') >= 0) {
                        v = await   console.log(`getOwners 403 (Forbidden, доступ запрещен):`, e);
                    } else {
                        console.log(`getOwners Не смог подключиться к:`, e);
                        v = await   notConnect.push(e);
                        console.log('EEEE: ', e);
                    }
                }
            })
            .then(async (context, data) => {
                let v;
                try {
                    await releasesMap.push(data);
                } catch (e) {
                    v = await  console.log(e); // Ошибка!
                }
            })
            .error(err => reject(err))
            .done(() => resolve(releasesMap));
    });
}

function getCountry() {
    console.log('Функция getCountry. Сюда должны подключиться: ', country);
    return new Promise((resolve, reject) => {
        let releasesMap = [];
        osmosis
        // Поиск на странице стран
            .get(country)
            .find('#bodycontent > ul.linkList > li')
            .set({
                'country': 'a/text()',
                'total': 'a>span',
                'url': 'a@href',
                'kennels': 'p'
            })
            .delay(5000)
            .then(async (context, data) => {
                let v;
                try {
                    let url = `${domain}${data.url}`;
                    data.kennels = await getKennels(url);
                } catch (e) {
                    v = await  console.log('В функции getKennels ++ произошла ошибка: ', e); // Ошибка!
                }
            })
            .then(async (context, data) => {
                let v;
                try {
                    await releasesMap.push(data);
                } catch (e) {
                    v = await  console.log('releasesMap не смог отдать: ', e); // Ошибка!
                }
            })
            .error(err => reject(err))
            .done(() => resolve(releasesMap))
            .log(console.log)
            .error(console.log)
            .debug(console.log);
    });
}

getCountry().then(function (res) {
    fs.writeFile('data.json', JSON.stringify(res, null, 4), function (err) {
        if (err) console.error('Возникла ошибка при записи в файл: ', err);
        else return console.log(`Data Saved to data.json file.`);

    });
    // console.log('Вывод в функции getCountry:', res);

}, function (err) {
    console.log('Ошибка! В функции getCountry:', err);
});
