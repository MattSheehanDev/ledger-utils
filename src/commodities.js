const execute = require('./utilities/process').execute;


class Commodity {
    constructor(name, count) {
        this.name = name;
        this.count = count;
    }
}

function GetAccountCommodities(accountName, dateStr, fileName, priceDB) {
    let cmd = `ledger bal ^"${accountName}" -f "${fileName}" \
    --price-db "${priceDB}" --current --now "${dateStr}" \
    --balance-format "%(scrub(display_total))\n"`;

    return execute(cmd).then((data) => {
        let commodityName = new Set();
        let commodities = new Set();

        let pairs = data.split('\n');
        for (let p of pairs) {
            let c = p.split(/\s/);
            if (c.length > 1) {
                if (!commodityName.has(c[1])) {
                    commodityName.add(c[1]);
                    commodities.add(new Commodity(c[1], c[0]));
                }
            }
        }
        return commodities;
    });
}


module.exports = {
    GetAccountCommodities
}
