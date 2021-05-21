const express = require('express');
const dotenv = require('dotenv');
const logger = require('./logger').getLogger();
const morgan = require('morgan');
const Alexa = require('ask-sdk-core');
const { ExpressAdapter } = require('ask-sdk-express-adapter');

module.exports = {
    boot: () => {
        // setting up environment variables
        dotenv.config();

        // initializing express framework
        const app = express();
        
        // setting up framework middlewares
        app.use(morgan('combined'));

        // initializing twilio integration
        const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        // getting alexa handlers
        const { 
            AlexaErrorHandler, 
            LaunchRequestHandler, 
            NotifyIntentHandler, 
            SessionEndedRequestHandler 
        } = require('./handlers')(client, logger, process.env.TWILIO_NUMBER, process.env.DESTINATION_NUMBER);

        // building app alexa skill handler
        const skillBuilder = Alexa.SkillBuilders.custom();
        const skill = skillBuilder
            .withSkillId(process.env.ALEXA_SKILL_ID)
            .withApiClient(new Alexa.DefaultApiClient())
            .addRequestHandlers(LaunchRequestHandler, NotifyIntentHandler, SessionEndedRequestHandler)
            .addErrorHandlers(AlexaErrorHandler)
            .create();
        const adapter = new ExpressAdapter(skill, true, true);

        // setting up application routes
        app.get('/', (req, res) => res.send('Hello World!'));
        app.post('/', (req, res, next) => {
            logger.info('Alexa sent a request');
            next();
        }, adapter.getRequestHandlers());

        // starting up http server
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            logger.info(`Server is listening to ${port} port`);
        });
    }
};
