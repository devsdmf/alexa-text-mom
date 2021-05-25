# Alexa, Text Mom

This is a simple NodeJS application using the Alexa Skill SDK and Twilio SDK to text my mom when I arrive at home (because I always forgot to).

The project uses a simple backend implementation to handler Alexa skill requests, written in NodeJS using Express framework. Feel free to fork it and use for your own needs.

## Requirements

- NodeJS 16+

## Installation

### 1. Clone the repository

The first thing you need to do is to clone or download the repository:

```
$ git clone https://github.com/devsdmf/alexa-text-mom.git /path/to/project
$ cd /path/to/project
```

### 2. Installing dependencies

Now, you need to install the project dependencies using NPM:

```
# assuming you're on the project root
$ npm install
```

### 3. Configuring the environment

Now you need to setup the environment variables necessary to run the application, so, the first thing is to copy the sample file and edit it with your own values for:

```
# assuming you're on the project root
$ cp .env.sample .env
$ edit .env
```

Make sure to complete all the necessary configuration values:
- TWILIO_ACCOUNT_SID - Your twilio account SID can be found on the project dashboard on Twilio platform
- TWILIO_AUTH_TOKEN - Your authentication token will be right after your account SID
- TWILIO_NUMBER - This is the number you bought on Twilio and must be in the following format "+XYYYZZZAAAA"
- ALEXA_SKILL_ID - This is the ID of your Custom Skill and can be found on the Alexa Console
- DESTINATION_NUMBER - The destination number that will receive the SMS message

### 4. Starting up the server

Now that you've configured the application, to start it just run the npm script:

```
$ npm run start
```

### Next Steps

Now that you have your application running, it is time to configure your Alexa skill to call this application when it receives an skill command, and you can do it through the Endpoints tab on the Skill Editing Console.

Make sure to use something to expose your local server (if it is the case) using some tunneling application like ngrok.

## License

This project is licensed under the [MIT license](LICENSE).
