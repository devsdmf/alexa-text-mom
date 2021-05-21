const Alexa = require('ask-sdk-core');

const TWILIO_STATUS_ACCEPTED = 'accepted';
const TWILIO_STATUS_SCHEDULED = 'scheduled';
const TWILIO_STATUS_QUEUED = 'queued';
const TWILIO_STATUS_SENDING = 'sending';
const TWILIO_STATUS_SENT = 'sent';
const TWILIO_STATUS_DELIVERED = 'delivered';
const TWILIO_STATUS_UNDELIVERED = 'undelivered';

const TWILIO_PENDING_STATUSES = [
    TWILIO_STATUS_ACCEPTED,
    TWILIO_STATUS_SCHEDULED,
    TWILIO_STATUS_QUEUED,
    TWILIO_STATUS_SENDING
];

const TWILIO_SUCCESSFUL_STATUSES = [
    TWILIO_STATUS_SENT,
    TWILIO_STATUS_DELIVERED
];

const TWILIO_FAILURE_STATUSES = [
    TWILIO_STATUS_UNDELIVERED
];

const ALEXA_STATUS_CONFIRMED = 'CONFIRMED';
const ALEXA_STATUS_DENIED = 'DENIED';

const isConfirmed = (s) => s === ALEXA_STATUS_CONFIRMED;

const INTENT_SMS_SENT_MESSAGE = 'Tudo bem, enviei um SMS avisando ela!';
const INTENT_SMS_SENDING_MESSAGE = 'Tudo bem, estou enviando um SMS para ela!';
const INTENT_SMS_ERROR_MESSAGE = 'Tentei enviar um SMS para ela, mas não consegui.';
const INTENT_SMS_NOT_SENT = 'Tudo bem, não vou avisá-la desta vez';

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
            const confirmed = isConfirmed(handlerInput
                .requestEnvelope
                .request
                .intent
                .confirmationStatus
            );

            let speechText = '';
            if (confirmed) {
                return twilioClient.messages.create({
                    body: 'Cheguei em casa!',
                    from,
                    to
                }).then(message => {
                    const responseBuilder = handlerInput.responseBuilder;
                    if (TWILIO_SUCCESSFUL_STATUSES.includes(message.status)) {
                        responseBuilder.speak(INTENT_SMS_SENT_MESSAGE);
                    } else if (TWILIO_PENDING_STATUSES.includes(message.status)) {
                        responseBuilder.speak(INTENT_SMS_SENDING_MESSAGE);
                    } else {
                        responseBuilder.speak(INTENT_SMS_ERROR_MESSAGE);
                    }

                    return responseBuilder.getResponse();
                });
            } else {
                return handlerInput
                    .responseBuilder
                    .speak(INTENT_SMS_NOT_SENT)
                    .getResponse();
            }
        }
    },
    SessionEndedRequestHandler: {
        canHandle: (handlerInput) => Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest',
        handle: (handlerInput) => handlerInput.responseBuilder.getRespose(),
    }
});
