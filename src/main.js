#!/usr/bin/env node

let minimist = require('minimist');

const commodity = require('./commodities');
const price = require('./prices');
const basis = require('./basis');
const Portfolio = require('./portfolio');

let argv = minimist(process.argv.slice(2));
// console.log(argv);


let datFile = process.env.LEDGER_FILE || '/home/matt/Dropbox/journals/finances/accounting/data/general.ledger';
let priceDB = process.env.PRICE_DB || '/home/matt/Dropbox/journals/finances/accounting/data/prices.ledger';



function CreatePortolios(fileName, priceDB, portfolios) {
    let promises = [];
    for (let portfolio of portfolios) {
        // let p = commodity.GetAccountCommodities(portfolio, fileName, priceDB).then((commodities) => {
        //     return new Portfolio(portfolio, commodities);
        // });
        let p = new Promise((resolve, reject) => {
            resolve(new Portfolio(portfolio, new Set(['ANCFX', 'AWSHX', 'CAIBX'])));
        });
        promises.push(p);
    }
    return Promise.all(promises);
}


if (argv.price) {
    let load = commodity.GetAccountCommodities('Assets:Portfolio', datFile, priceDB);
    load = load.then((commodities) => {
        return price.GetCurrentPrices(commodities);
    });
    load = load.then(() => {
        process.exit(0);
    });
    load = load.catch((err) => {
        process.stderr.write(err.toString());
        process.exit(1);
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
    });
    load = load.catch((err) => {
        process.stderr.write(err.toString());
        process.exit(1);
    });
}
else if (argv.cost) {
    let load = CreatePortolios(datFile, priceDB, [
        'Assets:Portfolio:Vanguard:Brokerage',
        'Assets:Portfolio:Vanguard:SEP',
        'Assets:Portfolio:Vanguard:Roth',
        'Assets:Portfolio:American Funds:IRA',
        'Assets:Portfolio:American Funds:Brokerage'
    ]);
    load = load.then((portfolios) => {
        return basis.GetCostBasis(portfolios, datFile, priceDB);
    });
    load = load.then(() => {
        process.exit(0);
    });
    load = load.catch((err) => {
        process.stderr.write(err.toString());
        process.exit(1);
    });
}
else {

}
