const YahooAPI = require('./api/yahooapi');
const datetime = require('./utilities/datetime').DateTime;


function GetCurrentPrices(commodities) {
    let load = YahooAPI.GetPrice(Array.from(commodities));
    load = load.then((data) => {
        if (data.query.count === 0 || !data.query.results) return;
        
        let quotes = data.query.results.quote;
        for (let quote of quotes) {
            let date;
            if (quote.LastTradeDate) {
                let split = quote.LastTradeDate.split('/');
                let year = parseInt(split[2]);
                let month = parseInt(split[0]) - 1;         // 1-12 is return from the server, Date month parameter should be 0-11
                let day = parseInt(split[1]);
                
                date = new Date(year, month, day);
            }
            else {
                date = new Date();
            }

            let formattedDate = datetime.format(date, 'yyyy/MM/dd');
            let currency = quote.Currency.toLowerCase() == 'usd' ? '$' : '';

            process.stdout.write(`P ${formattedDate} ${quote.Symbol} ${currency}${quote.LastTradePriceOnly}\r\n`);
        }
        process.stdout.write('\r\n');
    });
    return load;
}

function GetHistoricalPrices(commodities, date) {
    let formattedDate = datetime.format(date, 'yyyy-MM-dd');

    let load = YahooAPI.GetHistoricalPrice(Array.from(commodities), formattedDate, formattedDate);
    load = load.then((data) => {
        if (data.query.count <= 0 || !data.query.results) return;
        
        let quotes = data.query.results.quote;
        for (let quote of quotes) {
            let formattedDate = datetime.format(date, 'yyyy/MM/dd');

            process.stdout.write(`P ${formattedDate} ${quote.Symbol} $${quote.Close}\r\n`);
        }
        process.stdout.write('\r\n');
    });
    return load;
}


module.exports = {
    GetCurrentPrices,
    GetHistoricalPrices
}