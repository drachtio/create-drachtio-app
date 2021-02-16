# {{ appName }}

This application was created with the [create drachtio command](https://www.npmjs.com/package/create-drachtio-app).  This documentation was generated at the time when the project was generated and describes the functionality that was initially scaffolded.  Of course, you should feel free to modify or replace this documentation as you build out your own logic.

## SIP Request Handling

Based on the options that you have chosen,this application handles the following incoming SIP requests:

{% if handleInvite %}
### INVITE
{% if media %}
Incoming INVITE requests are simply connected to a freeswitch server, using [drachtio-fsmrf](https://www.npmjs.com/package/drachtio-fsmrf) and held until the caller hangs up.  The code shows how to obtain a media endpoint when connecting a call to a media server. Once you have an endpoint you can [perform media operations](https://github.com/drachtio/drachtio-fsmrf#performing-media-operations) on that endpoint.
{% else %}
The application acts as a [B2BUA](https://drachtio.org/api#srf-create-b2bua), showing how to create sip dialogs and manage them.  You will want to modify this code as needed for your scenario. 
{% endif %}
{% endif %}

{% if handleRegister %}
### REGISTER
The generated application provides rather full-feature registrar functionality.  It uses a curated set of drachtio middleware to challenge and authenticate REGISTER requests and maintains active registrations in a redis database.  You will want to modify the code in [lib/middleware.js](./lib/middleware.js) to swap in your own code for looking up passwords based on a sip username and realm (the generated password lookup code is simply hardcoded to return credentials needed for the tests).
{% endif %}

{% if handleSubscribe %}
### SUBSCRIBE
The generated application responds with 480 to incoming SUBSCRIBE messages (you should implement your own logic as appropriate).
{% endif %}

{% if handlePublish %}
### PUBLISH
The generated application responds with 480 to incoming PUBLISH messages (you should implement your own logic as appropriate).
{% endif %}

{% if handleInfo %}
### INFO
The generated application responds with 480 to incoming INFO messages (you should implement your own logic as appropriate).
{% endif %}

{% if handleMessage %}
### MESSAGE
The generated application responds with 480 to incoming MESSAGE messages (you should implement your own logic as appropriate).
{% endif %}

{% if handleOptions %}
### OPTIONS
The generated application responds with 200 to incoming OPTIONS messages (you should implement your own logic as appropriate).
{% endif %}

## Tests
{% if test %}
To run the generated test suite is a simple matter of:
```bash
$ npm test
```
Note that the test suite requires docker and docker-compose to be installed on your laptop/development machine.

You can also generate code coverage maps and put your code though a lint test
```bash
$ npm run coverage

$ npm run jslint
```

**Hint**: It is a good idea to continue to keep your test cases updated, and to build new ones to cover the additional functionality that 
{% else %}
Well, you chose not to generate the test suite when you generated the project so we got nothing for you.  You may want to go back and re-generate the project using the `--test` flag to get an initial docker-based test suite.  Just a suggestion.
{% endif %}
