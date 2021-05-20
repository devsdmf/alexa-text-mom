const Alexa = require('ask-sdk-core');

module.exports = (twilioClient, logger, from, to) => ({
    AlexaErrorHandler: {
        canHandle: (handlerInput, error) => {
            return error.name.startsWith('AskSdk');
        },
        handle: (handlerInput, error) => {
            logger.error('An error occurred at trying to process the Alexa intent');

            return handlerInput.responseBuilder
                .speak('Ocorreu um erro ao tentar executar a skill')
                .getResponse();
        }
    },
    LaunchRequestHandler: {
        canHandle: (handlerInput) => 
            Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest',
        handle: (handlerInput) => {
            const currentIntent = handlerInput.requestEnvelope.request.intent;
            return handlerInput.responseBuilder
                .addDelegateDirective({
                    name: 'NotifyIntent',
                    confirmationStatus: 'NONE',
                    slots: {}
                })
                .getResponse();
        }
    },
    NotifyIntentHandler: {
        canHandle: (handlerInput) => {
            return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
                Alexa.getIntentName(handlerInput.requestEnvelope) === 'NotifyIntent';
        },
        handle: (handlerInput) => {
            twilioClient.messages.create({
                body: 'Cheguei em casa!',
                from,
                to
            }).then(message => console.log('Message sent', message));

            const speechText = 'Tudo bem, vou enviar um SMS para ela!';

            return handlerInput.responseBuilder
                .speak(speechText)
                .getResponse();
        }
    },
    SessionEndedRequestHandler: {
        canHandle: (handlerInput) => Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest',
        handle: (handlerInput) => handlerInput.responseBuilder.getRespose(),
    }
});
