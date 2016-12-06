#!/usr/bin/env node


let child_process = require('child_process');
let exec = child_process.exec;


let request = require('request');

const Portfolio = require('./portfolio').Portfolio;

const datetime = require('./utilities/datetime').DateTime;
const fs = require('./utilities/filesystem');



function execute(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(stdout, stderr);
        });
    });
}

function send(uri) {
    return new Promise((resolve, reject) => {
        request(uri, (err, response, body) => {
            if (err) reject(err);
            else resolve(body);
        });
    });
}




let datFile = process.env.LEDGER_FILE || '/home/matt/Dropbox/journals/finances/accounting/data/general.ledger';
let priceDB = process.env.PRICE_DB || '/home/matt/Dropbox/journals/finances/accounting/data/prices.ledger';


function main() {
    let load = LoadPortolios([
        'Assets:Portfolio:Vanguard:Brokerage',
        'Assets:Portfolio:Vanguard:SEP',
        'Assets:Portfolio:Vanguard:Roth',
        'Assets:Portfolio:American Funds:IRA',
        'Assets:Portfolio:American Funds:Brokerage'
    ]);
    load = load.then((portfolios) => {
        let promises = [];
        // stringify cost basis for the portfolio
        for (let portfolio of portfolios) {
            let basis = getPortfolioCostBasis(portfolio);
            basis = basis.then((costs) => {
                let buf = '';
                for (let i = 0; i < costs.length - 1; i++) {
                    buf = buf.concat(costs[i]);
                    buf = buf.concat('\n');
                }

                buf = buf.concat('---\n');
                
                buf = buf.concat(costs[costs.length - 1]);
                return buf;
            });
            promises.push(basis);
        }
        return Promise.all(promises);
    });
    load = load.then((strBuffers) => {
        // concatenate the individual cost basis's
        let buf = '';
        for (let str of strBuffers) {
            buf = buf.concat(str);
            buf = buf.concat('\n\n\n\n');
        }

        process.stdout.write(buf);
    });
    load = load.then(() => {
        process.stdout.write('successfully wrote cost-basis\n');
    });
}


function LoadPortolios(portfolios) {
    let promises = [];
    for (let portfolio of portfolios) {
        let p = getPortfolioCommodities(p).then((commodities) => {
            return new Portfolio(portfolio, commodities);
        });
        promises.push(p);
    }
    return Promise.all(promises);
}

function getPortfolioCommodities(portfolioName) {
    let cmd = `ledger bal ^${portfolioName} -f ${datFile} \
    --price-db ${priceDB} \
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

//# The problem with cost-basis is that it should only include the commidities
//# and not any money sitting in the account as well.
//# This gives us the cost basis of vanguard sep, other accounts would be similar
//ledger -R --pedantic -f /home/matt/Dropbox/journals/finances/accounting/data/general.ledger bal ^Assets:Portfolio -B -H -I -X $ --limit 'commodity=~/VYM|BLV/' --price-db /home/matt/Dropbox/journals/finances/accounting/data/prices.ledger
function getPortfolioCostBasis(portfolio) {
    let promises = [];
    // get the cost-basis for each commodity in the portfolio, then for the entire portfolio later.
    for (let c of portfolio.commodities) {
        let cmd = `ledger bal ${portfolio.name} -R --pedantic -f ${datFile} \
        -B -H -I -X $ --limit 'commodity=~/${c}/' --price-db ${priceDB}`;
        
        promises.push(execute(cmd));
    }


    // get the cost-basis for the entire portfolio
    let cmd = `ledger bal ${portfolio.name} -R --pedantic -f ${datFile} \
    -B -H -I -X $ --limit 'commodity=~/${portfolio.joinCommodities('|')}/' --price-db ${priceDB}`;    
    promises.push(execute(cmd));

    return Promise.all(promises);
}





function fetchPrices() {
    let ex = execute(ledgerPrices);
    ex = ex.then((data) => {
        let commodities = new Set(data.split('\n'));
        let commStr = Array.from(commodities).join(',');

        let googleUri = `http://finance.google.com/finance/info?client=ig&q=${commStr}`;
        return send(googleUri);
    });
    ex = ex.then((data) => {
        // remove eval() guard //
        data = data.replace(/\/\//, '');
        let priceInfos = JSON.parse(data);

        let date = datetime.format(new Date(), 'yyyy/MM/dd');

        for (let info of priceInfos) {
            let ticker = info.t;

            let price = info.l;
            if (price && !price.match(/^$/)) {
                price = '$' + price;
            }
            
            process.stdout.write(`P ${date} ${ticker} ${price}\r\n`);
        }
        
        // we are done
        process.exit(0);
    });
    ex = ex.then(null, (err) => {
        process.stdout.write('There was an error executing the ledger command.');
        process.exit(1);
    });
}




main();




// let ledgerPrices = "ledger prices --prices-format '%a\n' --current \
// --price-db /home/matt/Dropbox/journals/finances/accounting/data/prices.ledger \
// -f /home/matt/Dropbox/journals/finances/accounting/data/general.ledger";//| sort | tr -d '\"' ";
// // this will output
// // VMFXX
// // VMFXX
// // VMFXX
// // VMFXX
// // VMFXX
// // ... (more)

// let ledgerBal = 'ledger -f /home/matt/Dropbox/journals/finances/accounting/data/general.ledger \
// --price-db /home/matt/Dropbox/journals/finances/accounting/data/prices.ledger \
// bal ^Assets:Portfolio --balance-format "%(scrub(display_total))\n"';
// // this will output
// // 245.1230 ANCFX
// // 192.8370 AWSHX
// // 60.00 BLV
// // 16.6040 CAIBX
// // 220.2880 VBLTX
// // 10,077.85 VMFXX
// // 68.00 VYM
// // 245.1230 ANCFX
// // 192.8370 AWSHX
// // 16.6040 CAIBX
// // 16.6040 CAIBX
// // 245.1230 ANCFX
// // 192.8370 AWSHX
// // 60.00 BLV
// // 220.2880 VBLTX
// // 10,077.85 VMFXX
// // 68.00 VYM
// // 10,036.76 VMFXX
// // 220.2880 VBLTX
// // 0.38 VMFXX
// // 60.00 BLV
// // 40.71 VMFXX
// // 68.00 VYM
// // 245.1230 ANCFX
// // 192.8370 AWSHX
// // 60.00 BLV
// // 16.6040 CAIBX
// // 220.2880 VBLTX
// // 10,077.85 VMFXX
// // 68.00 VYM