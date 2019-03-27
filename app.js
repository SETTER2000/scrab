const osmosis = require('osmosis');
const fs = require('fs');
const domain = 'http://www.chinesecrested.no';
const country = domain + '/en/registry/breeders/';

// Сделайте пользовательский агент браузером (Google Chrome в Windows)
osmosis.config('user_agent', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0');
// Если запрос не выполнен, не продолжайте повторную попытку (по умолчанию это 3)
osmosis.config('tries', 2);
// Параллельные запросы (по умолчанию это 5) делают это 2, поэтому мы не забиваем сайт
osmosis.config('concurrency', 2);
osmosis.config('proxy', "172.30.1.253:9150");
let list = [];
osmosis
    .get(country)
    .find('#bodycontent')
    .set('country')

    .data(function(data) {
       console.log(data);
    })
    .log(console.log)
    .error(console.log);
    // .debug(console.log);

return;
function getOwners(res) {
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
}

function getLitters(res) {
    return new Promise((resolve, reject) => {
        let list = [];
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
            })
            .data(data => list.push(data))
            .error(err => reject(err))
            .done(() => resolve(list))
        ;
    });
}

function getKennels(res) {
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
            // .delay(3000)
            .then(async (context, data) => {
                let v;
                try {
                    data.litters = await getLitters(domain + data.url);
                } catch (e) {
                    v = await  console.log('getLitters Не смог подключиться:', e); // Ошибка!
                }
            })
            .then(async (context, data) => {
                let v;
                try {
                    data.owners = await getOwners(domain + data.url);
                } catch (e) {
                    if (e.indexOf("(find) no results for") >= 0) {
                        v = await   console.log(`getOwners Не нашёл owner: ${domain + data.url}`, e);
                    } else if (e.indexOf('404 Not Found') >= 0) {
                        v = await   console.log(`getOwners Страница не найдена:`, e);}
                        else if (e.indexOf('403 Forbidden') >= 0) {
                        v = await   console.log(`getOwners 403 (Forbidden, доступ запрещен):`, e);
                    } else {
                        console.log(`getOwners Не смог подключиться к:`, e);
                        v = await   notConnect.push(e);
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
            // .delay(5000)
            .then(async (context, data) => {
                let v;
                try {
                    data.kennels = await getKennels(domain + data.url);
                } catch (e) {
                    v = await  console.log('В функции getKennels произошла ошибка: ', e); // Ошибка!
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
            .done(() => resolve(releasesMap));
    });
}

getCountry().then(function (res) {
    fs.writeFile('data.json', JSON.stringify(res, null, 4), function (err) {
        if (err) console.error('Возникла ошибка при записи в файл: ', err);
        else console.log(`Data Saved to data.json file.`);
    });
    // console.log('Вывод в функции getCountry:', res);

}, function (err) {
    console.log('Ошибка! В функции getCountry:', err);
});
