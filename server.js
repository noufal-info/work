const fs = require('fs');

process.on('uncaughtException', (err) => {
    fs.appendFileSync('crash.log', new Date().toISOString() + ' Uncaught Exception: ' + err.stack + '\n');
});

process.on('unhandledRejection', (reason, promise) => {
    fs.appendFileSync('crash.log', new Date().toISOString() + ' Unhandled Rejection: ' + reason + '\n');
});

let app;
try {
    app = require('./server/server.js');
} catch (err) {
    fs.appendFileSync('crash.log', new Date().toISOString() + ' Require Error: ' + err.stack + '\n');
}

module.exports = app;
