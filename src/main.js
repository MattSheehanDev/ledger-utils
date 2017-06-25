#!/usr/bin/env node

const minimist = require('minimist');

const commodity = require('./commodities');
const price = require('./prices');
const basis = require('./basis');
const Portfolio = require('./portfolio');

const datetime = require('./utilities/datetime').DateTime;
const execute = require('./utilities/process').execute;

let argv = minimist(process.argv.slice(2));


let datFile = process.env.LEDGER_FILE || '/home/matt/Dropbox/journals/finances/accounting/data/general.ledger';
let priceDB = process.env.LEDGER_PRICES || '/home/matt/Dropbox/journals/finances/accounting/data/prices.ledger';



// function joinCommodities(commodities, char) {
//     return Array.from(commodities).map((c) => { return c.name }).join(char);
// }
function CreatePortolios(fileName, dateStr, priceDB, accounts) {
    let p = Array.from(accounts).map((account, idx, arr) => {
        return commodity.GetAccountCommodities(account, dateStr, fileName, priceDB).then((commodities) => {
            return new Portfolio(account, commodities);
        });
    });
    return Promise.all(p);
}


if (argv.price) {
    let date = datetime.format(new Date(), 'yyyy/MM/dd');

    commodity.GetAccountCommodities('Assets:Portfolio', date, datFile, priceDB)
        .then((commodities) => {
            commodities = Array.from(commodities).map((c) => { return c.name });
            return price.GetCurrentPrices(commodities);
        })
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            process.stderr.write(JSON.stringify(err) + '\n');
            process.exit(1);
        });
}
else if (argv.historical) {
    let date = datetime.format(new Date(), 'yyyy/MM/dd');

    commodity.GetAccountCommodities('Assets:Portfolio', date, datFile, priceDB)
        .then((commodities) => {
            commodities = Array.from(commodities).map((c) => { return c.name });
            let date = new Date(argv.historical);
            return price.GetHistoricalPrices(commodities, date);
        })
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            process.stderr.write(JSON.stringify(err) + '\n');
            process.exit(1);
        });
}
else if (argv.cost) {
    let date = argv.date;
    if (!date) {
        date = datetime.format(new Date(), 'yyyy/MM/dd');
    }

    basis.GetPortfolios(date, datFile).then((accounts) => {
        return CreatePortolios(datFile, date, priceDB, accounts);
    }).then((portfolios) => {
        return basis.GetCostBasis(portfolios, date, datFile, priceDB);
    }).then(() => {
        process.exit(0);
    }).catch((err) => {
        process.stderr.write(JSON.stringify(err) + '\n');
        process.exit(1);
    });
}
else {

}
