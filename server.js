const fs = require('fs');

process.on('uncaughtException', (err) => {
    fs.appendFileSync('crash.log', new Date().toISOString() + ' Uncaught Exception: ' + err.stack + '\n');
});

process.on('unhandledRejection', (reason, promise) => {
    fs.appendFileSync('crash.log', new Date().toISOString() + ' Unhandled Rejection: ' + reason + '\n');
});

try {
    require('./server/server.js');
} catch (err) {
    fs.appendFileSync('crash.log', new Date().toISOString() + ' Require Error: ' + err.stack + '\n');
}
