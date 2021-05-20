const express = require('express');
const dotenv = require('dotenv');
const logger = require('./logger').getLogger();
const morgan = require('morgan');
const Alexa = require('ask-sdk-core');
const { ExpressAdapter } = require('ask-sdk-express-adapter');

module.exports = () => {
    dotenv.config();

    const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const app = express();

    const port = process.env.PORT || 3000;

    app.use(morgan('combined'));

    const { 
        AlexaErrorHandler, 
        LaunchRequestHandler, 
        NotifyIntentHandler, 
        SessionEndedRequestHandler 
    } = require('./handlers')(client, logger, process.env.TWILIO_NUMBER, process.env.DESTINATION_NUMBER);

    const skillBuilder = Alexa.SkillBuilders.custom();
    const skill = skillBuilder
        .withSkillId(process.env.ALEXA_SKILL_ID)
        .addRequestHandlers(LaunchRequestHandler, NotifyIntentHandler, SessionEndedRequestHandler)
        .addErrorHandlers(AlexaErrorHandler)
        .create();

    const adapter = new ExpressAdapter(skill, true, true);

    app.get('/', (req, res) => res.send('Hello World!'));
    app.post('/', (req, res, next) => {
        logger.info('Alexa sent a request');
        next();
    }, adapter.getRequestHandlers());

    app.listen(port, () => {
        console.log(process.env.ALEXA_SKILL_ID, process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN, process.env.TWILIO_NUMBER);
        logger.info(`Server is listening to ${port} port on localhost`);
    });
};
