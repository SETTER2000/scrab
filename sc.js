const fs = require('fs');
const _ = require('lodash');
const obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));

// console.log(obj[0].country);

let country = obj.filter(o=>{
    return o.country==='Russian Federation';
});
// let mapLettersRu = new Map(ruLetters[0].kennels);
console.log('Country: ', country);
country[0].kennels.map((val, key) => {
    console.log('Kennels:', val);
 });
// _.forEach(country[0].kennels, (val, key) => {
//     console.log('Kennels:', val);
// });
// console.log(mapLettersRu);

// console.log(letters[0].kennels);