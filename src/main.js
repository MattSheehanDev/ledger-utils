#!/usr/bin/env node

const minimist = require('minimist');

const commodity = require('./commodities');
const price = require('./prices');
const basis = require('./basis');
const Portfolio = require('./portfolio');

const datetime = require('./utilities/datetime').DateTime;

let argv = minimist(process.argv.slice(2));


let datFile = process.env.LEDGER_FILE || '/home/matt/Dropbox/journals/finances/accounting/data/general.ledger';
let priceDB = process.env.PRICE_DB || '/home/matt/Dropbox/journals/finances/accounting/data/prices.ledger';



function CreatePortolios(fileName, dateStr, priceDB, accounts) {
    let promises = [];
    for (let account of accounts) {
        let p = commodity.GetAccountCommodities(account, dateStr, fileName, priceDB).then((commodities) => {
            return new Portfolio(account, commodities);
        });
        promises.push(p);
    }
    return Promise.all(promises);
}


if (argv.price) {
    let date = datetime.format(new Date(), 'yyyy/MM/dd');

    let load = commodity.GetAccountCommodities('Assets:Portfolio', date, datFile, priceDB);
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
    let date = datetime.format(new Date(), 'yyyy/MM/dd');

    let load = commodity.GetAccountCommodities('Assets:Portfolio', date, datFile, priceDB);
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
    let date = argv.date;
    if (!date) {
        date = datetime.format(new Date(), 'yyyy/MM/dd');
    }

    let load = basis.GetPortfolios(date, datFile);
    load = load.then((accounts) => {
        return CreatePortolios(datFile, date, priceDB, accounts);
    });
    load = load.then((portfolios) => {
        return basis.GetCostBasis(portfolios, date, datFile, priceDB);
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
