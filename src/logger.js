const winston = require('winston');

const getLogger = () => winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [ new winston.transports.Console() ]
});

module.exports = {
    getLogger
}
