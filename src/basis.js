const execute = require('./utilities/process').execute;
const utils = require('./utilities/utility');



function GetPortfolios(dateStr, fileName) {
    let cmd = `ledger bal ^Assets:Portfolio -R --pedantic  -f ${fileName} \
    --balance-format "%A\n" --flat --current --now ${dateStr}`;

    let ex = execute(cmd);
    ex = ex.then((data) => {
        let accounts = new Set(data.split('\n').filter((v) => { return v != ''; }));
        return accounts;
    });
    return ex;
}


function GetCostBasis(portfolios, dateStr, fileName, priceDB) {
    let promises = [];
    // stringify cost basis for the portfolio
    for (let portfolio of portfolios) {
        let basis = getPortfolioCostBasis(fileName, dateStr, priceDB, portfolio);
        basis = basis.then((costs) => {
            let buf = '';
            for (let cost of costs) {
                buf = buf.concat(cost);
                buf = buf.concat('\r\n');
            }
            return buf;
        });
        promises.push(basis);
    }

    let costs = Promise.all(promises);
    costs = costs.then((strBuffers) => {
        // concatenate the individual cost basis's
        let buf = '';
        for (let str of strBuffers) {
            buf = buf.concat(str);
            buf = buf.concat('\r\n');
        }

        process.stdout.write(buf);
    });
    return costs;
}


//# The problem with cost-basis is that it should only include the commidities
//# and not any money sitting in the account as well.
//# This gives us the cost basis of vanguard sep, other accounts would be similar
//ledger -R --pedantic -f /home/matt/Dropbox/journals/finances/accounting/data/general.ledger bal ^Assets:Portfolio -B -H -I -X $ --limit 'commodity=~/VYM|BLV/' --price-db /home/matt/Dropbox/journals/finances/accounting/data/prices.ledger
function getPortfolioCostBasis(fileName, dateStr, priceDB, portfolio) {
    let promises = [];

    // get the cost-basis for the entire portfolio
    let cmd = `ledger bal ${portfolio.name} -R --pedantic -f ${fileName} \
    -B -H -I -X $ --limit 'commodity=~/${portfolio.joinCommodities('|')}/' --price-db ${priceDB}\
    --balance-format '%-15(round(scrub(display_total))) %A' --now ${dateStr} --current`;    
    promises.push(execute(cmd));

    // get the cost-basis for each commodity in the portfolio
    for (let c of portfolio.commodities) {
        let cmd = `ledger bal ${portfolio.name} -R --pedantic -f ${fileName} \
        -B -H -I -X $ --limit 'commodity=~/${c}/' --price-db ${priceDB}\
        --balance-format '%-15(round(scrub(display_total))) ${c}' --now ${dateStr} --current`;
        
        promises.push(execute(cmd));
    }

    return Promise.all(promises);

    // return new Promise((resolve, reject) => {
    //     let costs = [];
    //     for (let c of portfolio.commodities) {
    //         costs.push(`$3000.00 ${c} ${portfolio.name}`)
    //     }
    //     costs.push(`$9000.00 ${portfolio.name}`)
    //     // resolve([
    //     //     `$3000.00 ANCFX ${portfolio.name}`,
    //     //     `$2000.00 AWSHX ${portfolio.name}`,
    //     //     `$1000.00 CAIBX ${portfolio.name}`,
    //     //     `$6000.00 ${portfolio.name}`,
    //     // ]);
    //     resolve(costs);
    // });
}


module.exports = {
    GetPortfolios,
    GetCostBasis
}



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