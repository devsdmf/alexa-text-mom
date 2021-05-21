const Alexa = require('ask-sdk-core');

const {
    TWILIO_PENDING_STATUSES,
    TWILIO_SUCCESSFUL_STATUSES,
    TWILIO_FAILURE_STATUSES
} = require('./twilio/status');

const {
    ALEXA_STATUS_CONFIRMED
} = require('./alexa/status');

const isConfirmed = (s) => s === ALEXA_STATUS_CONFIRMED;

const { SMS_BODY } = require('./model/sms');

const {
    INTENT_SMS_SENT_MESSAGE,
    INTENT_SMS_SENDING_MESSAGE,
    INTENT_SMS_ERROR_MESSAGE,
    INTENT_SMS_NOT_SENT
} = require('./model/intentMessages');

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
        handle: async (handlerInput) => {
            const { requestEnvelope } = handlerInput;
            const confirmationStatus = requestEnvelope.request.intent.confirmationStatus;
            const confirmed = isConfirmed(confirmationStatus);

            if (confirmed) {
                const directiveClient = handlerInput.serviceClientFactory.getDirectiveServiceClient();
                const directive = {
                    header: {
                        requestId: requestEnvelope.request.requestId
                    },
                    directive: {
                        type: 'VoicePlayer.Speak',
                        speech: INTENT_SMS_SENDING_MESSAGE
                    }
                };

                return directiveClient.enqueue(
                    directive,
                    requestEnvelope.context.System.apiEndpoint,
                    requestEnvelope.context.System.apiAccessToken
                ).then(async () => twilioClient.messages.create({
                    body: SMS_BODY,
                    from,
                    to
                })).then(result => {
                    return new Promise((resolve, reject) => {
                        setTimeout(async () => {
                            const message = await twilioClient.messages(result.sid).fetch();
                            if (TWILIO_SUCCESSFUL_STATUSES.includes(message.status)) {
                                resolve(handlerInput
                                    .responseBuilder
                                    .speak(INTENT_SMS_SENT_MESSAGE)
                                    .getResponse());
                            } else if (TWILIO_FAILURE_STATUSES.includes(message.status)) {
                                resolve(handlerInput
                                    .responseBuilder
                                    .speak(INTENT_SMS_ERROR_MESSAGE)
                                    .getResponse());
                            }
                        }, 1000);
                    });
                }).catch(err => {
                    logger.err('An error occurred at trying to send the SMS', err);
                    return handlerInput
                        .responseBuilder
                        .speak(INTENT_SMS_ERROR_MESSAGE)
                        .getResponse();
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
        handle: (handlerInput) => handlerInput.responseBuilder.getResponse(),
    }
});
