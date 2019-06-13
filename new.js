const osmosis = require('osmosis');
const url = require('url');
const fs = require('fs');
const _ = require('lodash');
const domainRegistry = 'http://chinesecrested.no/en/registry/';
const domainBreeders = 'http://chinesecrested.no/en/registry/breeders/';
const domainOwners = 'http://chinesecrested.no/en/registry/owners/';
let releasesMap = [];
instance = new osmosis(domainBreeders);
instance.run();
const write = async (res) => {
    await fs.writeFile('data.json', JSON.stringify(res, null, 4), async function (err) {
        if (err) console.error('Возникла ошибка при записи в файл: ', err);
        else console.log(`Data Saved to data.json file.`);
    });
};
instance
    .find('.linkList > li')
    .set({
        country: 'a/text()',
        kennels: [
            osmosis
                .follow('a@href')
                .find('.linkList > li')
                .set({
                    'kennel': 'a/text()',
                    'kennelBreedingUrl': 'a@href'
                })
                .then(async (context, data) => {
                    try {
                        data.kennelOwnerUrl = `${domainOwners}${data.country}/${data.kennelBreedingUrl}`;
                        data.kennelBreedingUrl = `${domainBreeders}${data.country}/${data.kennelBreedingUrl}`;
                    } catch (e) {
                        await  console.log(e);
                    }
                })
                .set({
                    kennelBreeders: [
                        osmosis
                            .follow('a@href')
                            .find('#breedingListing>li')
                            .set({
                                'litterBorn': 'dl dd[1]',
                                'sire': 'dl dd[2] a/text()',
                                'dam': 'dl dd[3] a/text()',
                                'sireUrl': 'dl dd[2] a@href',
                                'damUrl': 'dl dd[3] a@href',
                                ////*[@id="breedingListing"]/li[1]/ul/li[1]/ul/li[1]/a
                                ////*[@id="breedingListing"]/li[1]/ul/li[2]/ul/li[1]/a
                                dogsUrl: ['ul>li>ul>li[1]>a@href'],
                                dogs: [
                                    osmosis
                                        .follow('ul>li>ul>li[1]>a@href')
                                        .find('#bodycontent')
                                        .set({
                                            'nameDog': 'h1',
                                            'regNumber': '.containerbox[1] .propertylist dd[1]',
                                            'dob': '.containerbox[1] .propertylist dd[2]',
                                            'color': '.containerbox[1] .propertylist dd[3]',
                                            'variety': '.containerbox[1] .propertylist dd[4]',
                                            'size': '.containerbox[1] .propertylist dd[5]',
                                            'breeder': '.entityrelation[1] dd[1]',
                                            'owner': '.entityrelation[1] dd[2]',
                                            'urlPageKennelBreeder': '.entityrelation[1] dd[2].a@href',
                                            'gallery': ['#dogsgallery a@href']
                                        })
                                ]
                            })
                    ]
                })
                .get((context, data) => data.kennelOwnerUrl)
                .find('#ownerListing[1] > li')
                .set({
                    'dogsUrl': ['ul>li>a@href'],
                    'kennelOwners': [
                        osmosis
                            .follow('ul>li>a@href')
                            .find('#breedingListing>li')
                            .set({
                                'nameDog': 'h1',
                                'regNumber': '.containerbox[1] .propertylist dd[1]',
                                'dob': '.containerbox[1] .propertylist dd[2]',
                                'color': '.containerbox[1] .propertylist dd[3]',
                                'variety': '.containerbox[1] .propertylist dd[4]',
                                'size': '.containerbox[1] .propertylist dd[5]',
                                'breeder': '.entityrelation[1] dd[1]',
                                'owner': '.entityrelation[1] dd[2]',
                                'urlPageKennelBreeder': '.entityrelation[1] dd[2].a@href',
                                'gallery': ['#dogsgallery a@href']
                            })
                    ],
                })
        ]
    })
    // .get((context, data) => data.kennelBreedingUrl)
    // .find('#breedingListing > li')
    // .set({
    //     'sire': 'dl dd[2] a/text()',
    //     'sireUrl': 'a@href',
    //     'dog': ['ul a@href']
    // })
    .data(data => releasesMap.push(data))
    // .log(console.log)
    .error(err => err)
    // .debug(console.log)
    .done(async () => write(releasesMap));