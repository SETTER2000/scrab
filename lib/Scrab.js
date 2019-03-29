const country = (url) => {
    return new Promise((resolve, reject) => {
        let releasesMap = [];
        osmosis
            .get(url)
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
};

module.exports = function (firstName) {
    this.base = function () {
        return firstName;
    }
};

