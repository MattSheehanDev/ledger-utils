const execute = require('./utilities/process').execute;


function GetAccountCommodities(accountName, dateStr, fileName, priceDB) {
    let cmd = `ledger bal ^"${accountName}" -f ${fileName} \
    --price-db ${priceDB} --current --now ${dateStr} \
    --balance-format "%(scrub(display_total))\n"`;

    let ex = execute(cmd);
    ex = ex.then((data) => {
        let commodities = new Set();

        let pairs = data.split('\n');
        for (let p of pairs) {
            let c = p.split(/\s/);
            if (c.length > 1) {
                commodities.add(c[1]);
            }
        }
        return commodities;
    });
    return ex;
}


module.exports = {
    GetAccountCommodities
}
