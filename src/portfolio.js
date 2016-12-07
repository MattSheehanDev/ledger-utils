
class Portfolio {
    constructor(name, commodities) {
        this.name = name;
        this.commodities = commodities
    }

    joinCommodities(char) {
        return Array.from(this.commodities).join(char);
    }
}


module.exports = Portfolio;
