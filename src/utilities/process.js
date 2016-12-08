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


module.exports = {
    execute
}