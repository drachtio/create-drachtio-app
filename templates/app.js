const Srf = require('drachtio-srf');
const srf = new Srf();
{% if media %}
const Mrf = require('drachtio-fsmrf');
const mrf = new Mrf(srf);
{% endif %}
const opts = Object.assign({
  timestamp: () => {return `, "time": "${new Date().toISOString()}"`;}
}, {level: process.env.LOGLEVEL || 'info'});
const logger = require('pino')(opts);
const {initLocals} = require('./lib/middleware')(logger);
{% if handleInvite %}
const CallSession = require('./lib/call-session');
{% endif %}

srf.connect({
  host: process.env.DRACHTIO_HOST || '127.0.0.1',
  port: process.env.DRACHTIO_PORT || 9022,
  secret: process.env.DRACHTIO_SECRET || 'cymru'
});
srf.on('connect', async(err, hp) => {
  if (err) return logger.error({err}, 'Error connecting to drachtio');
  logger.info(`connected to drachtio listening on ${hp}`);
{% if media %}
  try {
    const opts = {
      address: process.env.FREESWITCH_HOST || '127.0.0.1',
      port: process.env.FREESWITCH_PORT || 8021,
      secret: process.env.FREESWITCH_SECRET || 'ClueCon'
    };
    if ('test' === process.env.NODE_ENV) {
      Object.assign(opts, {
        advertisedAddress: 'docker-host',
        listenAddress: '0.0.0.0'
      });
    }
    srf.locals.ms = await mrf.connect(opts);
  } catch (err) {
    logger.error({err}, 'Error connecting to freeswitch');
  }
{% endif %}
});

{% if handleInvite %}
srf.invite([initLocals], (req, res) => {
  const session = new CallSession(req, res);
  session.connect();
});
{% endif %}

if ('test' === process.env.NODE_ENV) {
  const disconnect = () => {
    return new Promise ((resolve) => {
      srf.disconnect();
{% if media %}
      srf.locals.ms.disconnect();
{% endif %}
      resolve();
    });
  };

  module.exports = {srf, logger, disconnect};
}
