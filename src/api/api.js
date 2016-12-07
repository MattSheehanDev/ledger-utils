const request = require('request');



function Get(uri) {
    return new Promise((resolve, reject) => {
        request(uri, (err, response, body) => {
            if (err) reject(err);
            else resolve(body);
        });
    });
}

module.exports = { Get }
