# create-drachtio-app

Usage: create-drachtio-app [options] project-name

Options:
  -h, --help                        display help for command
  -m, --media                       include the [drachtio-fsmrf](https://www.npmjs.com/package/drachtio-fsmrf) package for media control
  -r, --request-types <methods...>  list the SIP request types to handle, or 'all' (default: ["invite"])
  -t, --test                        generate a docker-based test suite
  -v, --version                     display the current version


**Example**: 

Scaffold an application that wants to handle INVITEs and REGISTERs, with a test suite and with media control support

```bash
  $ create-drachtio-app -m -t invite register my-app

Creating a new drachtio app in ../my-app

  $ cd my-app
  $ npm test
> my-app@1.0.0 test /Users/dhorton/beachdog-enterprises/beachdog-networks/git/temp/my-app
> NODE_ENV=test LOGLEVEL=error DRACHTIO_PORT=9060 FREESWITCH_PORT=8022 REDIS_PORT=16379 node test/ | ./node_modules/.bin/tap-spec


  starting docker network..

    ✔ docker network is up

  sip tests

    ✔ invite test passes
    ✔ register test passes

  stopping docker network..



  total:     3
  passing:   3
  duration:  7.3s

```

