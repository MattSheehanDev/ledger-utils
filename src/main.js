#!/usr/bin/env node

let minimist = require('minimist');

const commodity = require('./commodities');
const price = require('./prices');
const basis = require('./basis');

let argv = minimist(process.argv.slice(2));
// console.log(argv);


let datFile = process.env.LEDGER_FILE || '/home/matt/Dropbox/journals/finances/accounting/data/general.ledger';
let priceDB = process.env.PRICE_DB || '/home/matt/Dropbox/journals/finances/accounting/data/prices.ledger';


if (argv.price) {
    let load = commodity.GetAccountCommodities('Assets:Portfolio', datFile, priceDB);
    load = load.then((commodities) => {
        return price.GetCurrentPrices(commodities);
    });
    load = load.then(() => {
        process.exit(0);  
    }, () => {
        process.exit(0);
    });
}
else if (argv.historical) {
    let load = commodity.GetAccountCommodities('Assets:Portfolio', datFile, priceDB);
    load = load.then((commodities) => {
        let date = new Date(argv.historical);
        return price.GetHistoricalPrices(commodities, date);
    });
    load = load.then(() => {
        process.exit(0);
    }, () => {
        process.exit(1);
    });
}
else if (argv.cost) {
    let load = basis.GetCostBasis(datFile, priceDB);
    load = load.then(() => {
        process.exit(0);
    }, () => {
        process.exit(1);
    });
}
else {

}
