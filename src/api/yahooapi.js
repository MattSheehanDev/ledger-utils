const API = require('./api');



const YQL_URL = 'https://query.yahooapis.com/v1/public/yql';
const YQL_FORMAT = 'json';
const YQL_ENV = encodeURIComponent('http://datatables.org/alltables.env');
// const YQL_ENV = `env=${encodeURIComponent('store://datatables.org/alltableswithkeys')}`;



export function GetPrice(ticker) {
    // yahoo.finance.quotes
    let symbols = `(${concatTickers(ticker)})`;
    let query = `select * from yahoo.finance.quotes where symbol in ${symbols}`;

    return Get(query);
}

export function GetHistoricalPrice(ticker, startDate, endDate) {
    // yahoo.finance.historicaldata
    // NOTE: if startDate and endDate does not cover a range when the market was open 
    // then HistoricalResult.results will be null
    let symbols = `(${concatTickers(ticker)})`;
    let query = `select * from yahoo.finance.historicaldata where symbol in ${symbols}`;
    query += ` and startDate = "${startDate}" and endDate = "${endDate}"`;

    return Get(query);
}


function Get(query) {
    let component = `q=${encodeURIComponent(query)}&format=${YQL_FORMAT}&env=${YQL_ENV}`;
    let uri = `${YQL_URL}?${component}`;

    return API.Get(uri).then((value) => {
        return JSON.parse(value);
    });
}

function concatTickers(ticker) {
    if (Array.isArray(ticker)) {
        let s = ticker.map((t) => { `"${t}"` });
        return s.join(', ');
    }
    else {
        return `"${ticker}"`;
    }
}


module.exports = {
    GetPrice,
    GetHistoricalPrice
}



// export interface QuoteResult {
//     query: {
//         count: number;                  // number of quotes
//         created: string;                // YYYY-MM-DDTHH:MM:SSZ
//         lang: string;
//         results: {
//             quote: Quote | Quote[];
//         }
//     }
// }

// export interface Quote {
//     symbol: string;
//     Ask: string;
//     AverageDailyVolume: string;
//     Bid: string;
//     AskRealtime: null;
//     BidRealtime: null;
//     BookValue: string;
//     Change_PercentChange: string;
//     Change: string;
//     Commission: null;
//     Currency: 'USD';
//     ChangeRealtime: null;
//     AfterHoursChangeRealtime: null;
//     DividendShare: string;              // Dividend per share
//     LastTradeDate: string;              // MM/DD/YYY
//     TradeDate: null;
//     EarningsShare: string;              // Earnings per share
//     EPSEstimatedCurrentYear: string;
//     EPSEstimatedNextYear: string;
//     EPSEstimatedNextQuarter: string;
//     DaysLow: string;
//     DaysHigh: string;
//     YearLow: string;
//     YearHigh: string;
//     HoldingsGainPercent: null;
//     AnnualizedGain: null;
//     HoldingsGain: null;
//     HoldingsGainPercentRealtime: null;
//     HoldingsGainRealtime: null;
//     MoreInfo: null;
//     OrderBookRealtime: null;
//     MarketCapitalization: string;
//     MarketCapRealtime: null;
//     EBITDA: string;
//     ChangeFromYearLow: string;
//     PercentChangeFromYearLow: string;
//     LastTradeRealtimeWithTime: null;
//     ChangePercentRealtime: null;
//     ChangeFromYearHigh: string;
//     PercentChangeFromYearHigh: string;
//     LastTradeWithTime: string;
//     LastTradePriceOnly: string;
//     HighLimit: null;
//     LowLimit: null;
//     DaysRange: string;
//     DaysRangeRealtime: null;
//     FiftydayMovingAverage: string;
//     ChangeFromTwoHundredMovingAverage: string;
//     PercentChangeFromTwoHundredMovingAverage: string;
//     ChangeFromFiftydayMovingAverage: string;
//     PercentChangeFromFiftydayMovingAverage: string;
//     Name: string;
//     Notes: null;
//     Open: string;
//     PreviousClose: string;
//     PricePaid: null;
//     ChangeinPercent: string;
//     PriceSales: string;
//     PriceBook: string;
//     ExDividendDate: string;
//     PERatio: string;
//     DividendPayDate: string;
//     PERatioRealtime: null;
//     PEGRatio: string;
//     PriceEPSEstimatedCurrentYear: string;
//     PriceEPSEstimatedNextYear: string;
//     Symbol: string;
//     SharesOwned: null;
//     ShortRatio: string;
//     LastTradeTime: string;
//     TickerTrend: null;
//     OneyrTargetPrice: string;
//     Volume: string;
//     HoldingsValue: null;
//     HoldingsValueRealtime: string;
//     YearRange: string;
//     DaysValueChange: null;
//     DaysValueChangeRealtime: null;
//     StockExchange: string;
//     DividendYield: string;
//     PercentChange: string;
// }


// export interface HistoricalResult {
//     query: {
//         count: number;                  // number of quotes
//         created: string;                // YYYY-MM-DDTHH:MM:SSZ
//         lang: string;
//         results: {
//             quote: HistoricalQuote | HistoricalQuote[];
//         }
//     }
// }

// export interface HistoricalQuote {
//     Symbol: string;
//     Date: string;               // YYYY-MM-DD
//     Open: string;
//     Close: string;
//     High: string;
//     Low: string;
//     Volume: string;
//     Adj_Close: string;
// }
