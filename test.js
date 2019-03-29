const items = require('./arr');
const fs = require('fs');
const osmosis = require('osmosis');
const items2 = ['http://www.chinesecrested.no/en/registry/breeders/Argentina/Loka+Samsara.html',
    'http://www.chinesecrested.no/en/registry/breeders/England/Dragonland.html'];
// const country = 'http://www.chinesecrested.no/en/registry/breeders/Argentina/Loka+Samsara.html';
// console.log(items);
let res = [];

function getOwners(res) {
    return new Promise((resolve, reject) => {
        let list = [];
        osmosis
            .get(res)
            .find('//*[@id="kennelmenu"]/li[1]/a')
            .follow('@href')
            .set('href')
            //
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
            .delay(5000)
            .data(item => list.push(item))
            .error(err => reject(err + ' ' + res))
            .done(() => resolve(list));
    });
}

items2.map(async (link) => {
    try {
        res.push(await getOwners(link));
        fs.writeFile('data_test.json', JSON.stringify(res, null, 4), function (err) {
            if (err) console.error('Возникла ошибка при записи в файл: ', err);
            else console.log(`Data Saved to data.json file.`);
        });
        console.log(res);
    } catch (e) {
        console.log('ERROR: ', e);
    }
});


/*function resolveAfter2Seconds(x) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(x);
        }, 15000);
    });
}*/
/*

async function f1() {
    var x = await resolveAfter2Seconds(10);
    console.log('f1(): ',x); // 10
}
f1();

async function f2() {
    var y = await 20;
    console.log('f2(): ',y); // 20
}
f2();
*/

/*const numbers = ['one','two', 'tree'];
const doubles = numbers.map(function(num) {
    return num +'-go';
});*/