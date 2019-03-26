const osmosis = require('osmosis');
const fs = require('fs');
const domain = 'www.chinesecrested.no';
const country = domain + '/en/registry/breeders/';
let savedData = [];
// Сделайте пользовательский агент браузером (Google Chrome в Windows)
osmosis.config('user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36');
// Если запрос не выполнен, не продолжайте повторную попытку (по умолчанию это 3)
osmosis.config('tries', 2);
// Параллельные запросы (по умолчанию это 5) делают это 2, поэтому мы не забиваем сайт
osmosis.config('concurrency', 3);


function getOwners(res) {
    return new Promise((resolve, reject) => {
        let list = [];
        osmosis
        // Поиск на странице стран
            .get('http://www.chinesecrested.no/en/registry/breeders/Argentina/Patagonia+Ranch.html')
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
            .get(domain + res)
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
            .get(domain + res)
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
                getLitters(data.url).then(function (res) {
                    data.litters = res;
                }, function (reason) {
                    console.log(reason); // Ошибка!
                });
                getOwners(data.url).then(function (res) {
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
                getKennels(data.url).then(function (res) {
                    data.kennels = res;
                    releasesMap.push(data);
                    fs.writeFile('data.json', JSON.stringify(releasesMap, null, 4), function (err) {
                        if (err) console.error('Возникла ошибка при записи в файл: ',err);
                        else console.log(`Data Saved to data.json file. Country: ${data.country}`);
                    })
                }, function (reason) {
                    console.log('В функции getKennels произошла ошибка: ', reason); // Ошибка!
                });
            })
            .error(err => reject(err))
            .done(() => resolve(releasesMap));
    });
}

// getCountry().then(res => {
//     console.log(res);
// });

getCountry().then(function (res) {
    console.log(res);
}, function (err) {
    console.log(err);
});
// return;
//
// function getUpcomingMusicReleases() {
//     return new Promise((resolve, reject) => {
//         let currentDate = null;
//         let releasesMap = {};
//
//         osmosis
//         // Load upcoming music page
//             .get('http://www.metacritic.com/browse/albums/release-date/coming-soon/date')
//             // Find the first music table and all of its tr elements
//             .find('.releaseCalendar .musicTable:first tr')
//             // Construct an object containing release date and its relevant releases
//             .set({
//                 // Get the release date (if relevant)
//                 releaseDate: 'th',
//                 // For every release on this date create an array
//                 artist: '.artistName',
//                 album: '.albumTitle'
//             })
//             // Transform our flat data into a tree like structure by creating a nested object
//             .then(async (context, data) => {
//                 // Is the current object a release date?
//                 if (typeof data.releaseDate !== 'undefined') {
//                     // Store the current date
//                     currentDate = data.releaseDate;
//
//                     // Create an empty array where we can push releases into
//                     releasesMap[currentDate] = [];
//                 } else {
//                     // Это релиз, а не дата, нажмите объект с исполнителем и названием альбома
//                     const artwork = await getArtwork(data.artist, data.album);
//                     releasesMap[currentDate].push(data);
//                 }
//             })
//             .error(err => reject(err))
//             .done(() => resolve(releasesMap));
//     });
// }
//
// getUpcomingMusicReleases().then(res => {
//     console.log(res);
// });
// return;
// /*function getCountry() {
//     return new Promise((resolve, reject) => {
//         let list = [];
//
//         osmosis
//         // Поиск на странице стран
//             .get(country)
//             .find('#bodycontent > ul.linkList > li')
//             .set({
//                 'country':'a/text()',
//                 'kennels':'a>span',
//                 'kennelUrl':'a@href',
//
//             })
//
//             // .follow('@href')
//             // .find('#bodycontent > ul.linkList >li > a')
//             //
//             // .set('kennels')
//             // .follow('@href')
//             // .find('ul#breedingListing')
//             // .set({'litters':['li>dl>dd[1]']})
//
//             .data(data => {
//                 // Each iteration, push the data into our array
//                 console.log('Записываемые данные: ',data);
//                 list.push(data);
//             })
//             .error(err => reject(err))
//             .done(() => resolve(list));
//     });
// }
// getCountry().then(list => {
//     console.log(list);
// });*/
// // function getKennels() {
// //     return new Promise((resolve, reject) => {
// //         let list = [];
// //
// //         osmosis
// //         // Поиск на странице стран
// //             .get(country)
// //             .find('#bodycontent > ul.linkList > li')
// //             .set({
// //                 'country':'a/text()',
// //                 'kennels':'a>span',
// //                 'kennelUrl':'a@href',
// //
// //             })
// //
// //             // .follow('@href')
// //             // .find('#bodycontent > ul.linkList >li > a')
// //             //
// //             // .set('kennels')
// //             // .follow('@href')
// //             // .find('ul#breedingListing')
// //             // .set({'litters':['li>dl>dd[1]']})
// //
// //             .data(data => {
// //                 // Each iteration, push the data into our array
// //                 console.log('Записываемые данные: ',data);
// //                 list.push(data);
// //             })
// //             .error(err => reject(err))
// //             .done(() => resolve(list));
// //     });
// // }
//
//
// return;
//
// function scrapeGoogle() {
//     return new Promise((resolve, reject) => {
//         let list = [];
//
//         osmosis
//         // Do Google search
//             .get('https://www.google.co.in/search?q=cats')
//             .paginate('#navcnt table tr > td a[href]', 3)
//             .delay(2000) // delay 2 seconds between pagination calls
//             // All apps exist inside of a div with class card-content
//             .find('.g')
//             // Create an object of data
//             .set({
//                 link: 'h3 a@href', // Search result link
//                 title: 'h3', // Title
//             })
//             .data(data => {
//                 // Each iteration, push the data into our array
//                 list.push(data);
//             })
//             .error(err => reject(err))
//             .done(() => resolve(list));
//     });
// }
//
// scrapeGoogle().then(list => {
//     console.log(list);
// });
// return;
//
// function getNewsTitles() {
//     return new Promise((resolve, reject) => {
//         let stories = [];
//
//         osmosis
//         // The URL we are scraping
//             .get('https://www.nytimes.com/section/world')
//             // Find all news stories with the class story-body
//             .find('article')
//             .set({
//                 // Get the first link href value inside of each story body
//                 link: 'a:first@href',
//                 // Get the news story title
//                 title: 'h2',
//                 // Get the news story summary
//                 summary: '.summary',
//                 // Get the image source for the story
//                 img: 'img@src'
//             })
//             .data(data => {
//                 // Push each news story found into an array we'll send back when we are done
//                 stories.push(data);
//             })
//             .error(err => reject(err))
//             .done(() => resolve(stories));
//     });
// }
//
// getNewsTitles().then(stories => {
//     // Should contain all news stories found
//     console.log(stories);
// });
//
// return;
//
//
// osmosis
//     .get(suite)
//     // .find('#bodycontent')
//     // .paginate('#bodycontent > .linkList > li > a[href]',2)
//     .find('#bodycontent > ul.linkList > li > a')
//     .set('country')
//     .follow('@href')
//     .find('#bodycontent > ul.linkList >li > a')
//
//     /*  .then((page)=>{
//           page.find('#bodycontent > ul.linkList>li > a')
//
//           // console.log('Значение',page)
//       },(err)=>{
//           if(err) return console.log('Error:', err);
//
//       })*/
//     .set('kennels')
//     .follow('@href')
//     .find('ul#breedingListing')
//     .set({'litters': ['li>dl>dd[1]']})
//     //  .train({'Litter born':'li>dl>dd[1]'})
//     // .set('lit')
//
//     // .set({'country2': ['#bodycontent > ul > li > a[href]']})
//     // .find('#bodycontent > ul > li > a[href]')
//
//     //  .follow('@href')
//     //  .set('Country')
//     //
//
//     // .set({'related': ['.linkList li a']})
//     // .find('header + div + div li > a')
//
//     .data(console.log)
//     .log(console.log) // включить логи
//     .error(console.error)
//
//     .data(function (data) {
//         console.log('Записываемые данные: ', data.country);
//         savedData.push(data);
//     })
//     .done(function () {
//         fs.writeFile('data.json', JSON.stringify(savedData, null, 4), function (err) {
//             if (err) console.error(err);
//             else console.log('Data Saved to data.json file');
//         })
//     });


// osmosis
//     .get('www.craigslist.org/about/sites')
//     .find('h1 + div a')
//     .set('location')
//     .follow('@href')
//     .find('header + div + div li > a')
//     .set('category')
//     .follow('@href')
//     .data(function (data) {
//         console.log(data);
//         savedData.push(data);
//     })
//     .done(function() {
//         fs.writeFile('data2.json', JSON.stringify( savedData, null, 4), function(err) {
//             if(err) console.error(err);
//             else console.log('Data Saved to data2.json file');
//         })
//     });
// osmosis
//     .get(suite)
//     .find('#bodycontent')
//     .follow('@href')
//     .set({'related': ['.linkList li a']})
//
//   //  .paginate('#bodycontent ul li > a[href]', 2)
//     // .data(console.log)
//    // .log(console.log) // включить логи
//     .data(function(data) {
//         console.log(data);
//         savedData.push(data);
//     })
//     .done(function() {
//         fs.writeFile('data.json', JSON.stringify( savedData, null, 4), function(err) {
//             if(err) console.error(err);
//             else console.log('Data Saved to data.json file');
//         })
//     });


// osmosis
//     .get('www.craigslist.org/about/sites')
//     .find('h1 + div a')
//     .set('location')
//     .follow('@href')
//     .find('header + div + div li > a')
//     .set('category')
//     .follow('@href')
//     .paginate('.totallink + a.button.next:first')
//     .find('p > a')
//     .follow('@href')
//     .set({
//         'title':        'section > h2',
//         'description':  '#postingbody',
//         'subcategory':  'div.breadbox > span[4]',
//         'date':         'time@datetime',
//         'latitude':     '#map@data-latitude',
//         'longitude':    '#map@data-longitude',
//         'images':       ['img@src']
//     })
//     .data(function(listing) {
//         // do something with listing data
//     })
//     .log(console.log)
//     .error(console.log)
//     .debug(console.log);
//
//
// osmosis
//     .get(suite)
//     .find('.resourcescontent ul.app-card-grid')
//     .follow('li a[href]')
//     .find('.resourcescontent')
//     .set({
//         'appname': '.app-header__details h1',
//         'email': '#AppInfo table tbody tr:nth-child(2) td > a'
//     })
//     .log(console.log)   // включить логи
//     .data(function(data) {
//         console.log(data);
//         savedData.push(data);
//     })
//     .done(function() {
//         fs.writeFile('data.json', JSON.stringify( savedData, null, 4), function(err) {
//             if(err) console.error(err);
//             else console.log('Data Saved to data.json file');
//         })
//     });