const osmosis = require('osmosis');
const fs = require('fs');
const domain = 'www.chinesecrested.no';
const country = domain + '/en/registry/breeders/';
// Сделайте пользовательский агент браузером (Google Chrome в Windows)
osmosis.config('user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36');
// Если запрос не выполнен, не продолжайте повторную попытку (по умолчанию это 3)
osmosis.config('tries', 2);

// Параллельные запросы (по умолчанию это 5) делают это 2, поэтому мы не забиваем сайт
osmosis.config('concurrency', 2);


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
            .done(() => resolve(list));
    });
}

function getKennels(res) {
    return new Promise((resolve, reject) => {
        let releasesMap = [];
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
            // .delay(5000)
            .then(async (context, data) => {
                getLitters(domain + data.url).then(function (res) {
                    data.litters = res;

                }, function (reason) {
                    console.log(reason); // Ошибка!
                });

            })
            .then(async (context, data) => {
                getOwners(domain + data.url).then(function (res) {
                    data.owners = res;
                }, function (reason) {
                    console.log(reason); // Ошибка!
                });
                releasesMap.push(data);
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
            .delay(5000)
            .then(async (context, data) => {
                getKennels(domain + data.url).then(function (res) {
                    data.kennels = res;
                    releasesMap.push(data);

                }, function (reason) {
                    console.log('В функции getKennels произошла ошибка: ', reason); // Ошибка!
                });
            })
            .error(err => reject(err))
            .done(() => resolve(releasesMap));
    });
}

getCountry().then(function (res) {
    fs.writeFile('data.json', JSON.stringify(res, null, 4), function (err) {
        if (err) console.error('Возникла ошибка при записи в файл: ', err);
        else console.log(`Data Saved to data.json file. Country:`);
    });
    // console.log('Вывод в функции getCountry:', res);

}, function (err) {
    console.log('Ошибка! В функции getCountry:', err);
});
