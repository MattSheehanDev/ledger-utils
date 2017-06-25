
class Portfolio {
    constructor(name, commodities, value) {
        this.name = name;
        this.commodities = commodities;
        this.value = value;
    }

    joinCommodities(char) {
        return Array.from(this.commodities).map((c) => { return c.name }).join(char);
    }
}


module.exports = Portfolio;
