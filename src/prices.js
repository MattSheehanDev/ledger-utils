#!/usr/bin/env node

console.log('Hello');
let request = require('request');
let datetime = require('./datetime').DateTime;

let child_process = require('child_process');
let exec = child_process.exec;

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
        });write
    });
}


//# The problem with cost-basis is that it should only include the commidities
//# and not any money sitting in the account as well.
//# This gives us the cost basis of vanguard sep, other accounts would be similar
//ledger -R --pedantic -f /home/matt/Dropbox/journals/finances/accounting/data/general.ledger bal ^Assets:Portfolio -B -H -I -X $ --limit 'commodity=~/VYM|BLV/' --price-db /home/matt/Dropbox/journals/finances/accounting/data/prices.ledger


let ledgerPrices = "ledger prices --prices-format '%a\n' --current \
--price-db /home/matt/Dropbox/journals/finances/accounting/data/prices.ledger \
-f /home/matt/Dropbox/journals/finances/accounting/data/general.ledger";//| sort | tr -d '\"' ";
// this will output
// VMFXX
// VMFXX
// VMFXX
// VMFXX
// VMFXX
// ... (more)

let ledgerBal = 'ledger -f /home/matt/Dropbox/journals/finances/accounting/data/general.ledger \
--price-db /home/matt/Dropbox/journals/finances/accounting/data/prices.ledger \
bal ^Assets:Portfolio --balance-format "%(scrub(display_total))\n"';
// this will output
// 245.1230 ANCFX
// 192.8370 AWSHX
// 60.00 BLV
// 16.6040 CAIBX
// 220.2880 VBLTX
// 10,077.85 VMFXX
// 68.00 VYM
// 245.1230 ANCFX
// 192.8370 AWSHX
// 16.6040 CAIBX
// 16.6040 CAIBX
// 245.1230 ANCFX
// 192.8370 AWSHX
// 60.00 BLV
// 220.2880 VBLTX
// 10,077.85 VMFXX
// 68.00 VYM
// 10,036.76 VMFXX
// 220.2880 VBLTX
// 0.38 VMFXX
// 60.00 BLV
// 40.71 VMFXX
// 68.00 VYM
// 245.1230 ANCFX
// 192.8370 AWSHX
// 60.00 BLV
// 16.6040 CAIBX
// 220.2880 VBLTX
// 10,077.85 VMFXX
// 68.00 VYM

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

