import path = require('path');
import fs from '../utilities/filesystem';


namespace GoogleAPI {


    export function GetGPrice() {
        return new Promise<any>((resolve: Function, reject: Function) => {
            let root = 'https://www.google.com/finance/info';
            let query = 'NSE%3AAIAENG%2CATULAUTO';
            let d = decodeURIComponent('https://www.google.com/finance/info?q=NSE%3AAIAENG%2CATULAUTO');

            let uri = `${root}?q=${query}`;

            fs.ReadFile(path.join(process.cwd(), 'test/googlefinance.json')).then((body: string) => {

                let match = body.match(/(?:\s)*\/\/(?:\s)*/i);
                if (match.length > 0) {
                    let first = match[0];
                    body = body.substring(first.length);
                }

                let result = JSON.parse(body);
                resolve(result);

            }, (err: any) => {

                reject(err);

            });

        //     API.Get(uri).then((value: string) => {

        //         let result = JSON.parse(value);
        //         resolve(result);

        //     }, (err: any) => {
        //         reject(err);
        //     });
        });
    }

}


// function fetchPrices() {
//     let ex = execute(ledgerPrices);
//     ex = ex.then((data) => {
//         let commodities = new Set(data.split('\n'));
//         let commStr = Array.from(commodities).join(',');

//         let googleUri = `http://finance.google.com/finance/info?client=ig&q=${commStr}`;
//         return API.Get(googleUri);
//     });
//     ex = ex.then((data) => {
//         // remove eval() guard //
//         data = data.replace(/\/\//, '');
//         let priceInfos = JSON.parse(data);

//         let date = datetime.format(new Date(), 'yyyy/MM/dd');

//         for (let info of priceInfos) {
//             let ticker = info.t;

//             let price = info.l;
//             if (price && !price.match(/^$/)) {
//                 price = '$' + price;
//             }
            
//             process.stdout.write(`P ${date} ${ticker} ${price}\r\n`);
//         }
        
//         // we are done
//         process.exit(0);
//     });
//     ex = ex.then(null, (err) => {
//         process.stdout.write('There was an error executing the ledger command.');
//         process.exit(1);
//     });
// }
