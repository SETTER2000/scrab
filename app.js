const osmosis = require('osmosis');
const fs = require('fs');
const suite = 'www.chinesecrested.no/en/registry/breeders/';
let savedData = [];
// osmosis
//     .get(suite)
//     .set({'Title': 'title'})
//     .data(console.log);

osmosis
    .get(suite)
    // .find('#bodycontent')
    .find('#bodycontent ul a[href]')
   // .set({'related': ['ul li > a[href]']})
    .set('Country')
    .follow('@href')
    // .set({'related': ['.linkList li a']})
    .find('header + div + div li > a')
    .data(function (data) {
        console.log(data);
        savedData.push(data);
    })
    .done(function() {
        fs.writeFile('data.json', JSON.stringify( savedData, null, 4), function(err) {
            if(err) console.error(err);
            else console.log('Data Saved to data.json file');
        })
    });

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