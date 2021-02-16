const {isUacBehindNat, getSipProtocol, NAT_EXPIRES} = require('./utils');
const parseUri = require('drachtio-srf').parseUri;
const debug = require('debug')('drachtio:{{ appName }}');

module.exports = handler;

function handler({logger}) {
  return async(req, res) => {
    debug(`received ${req.method} from ${req.protocol}/${req.source_address}:${req.source_port}`);

    if ('register' === req.registration.type && '0' !== req.registration.expires) await register(logger, req, res);
    else await unregister(logger, req, res);

    req.srf.endSession(req);
  };
}

async function register(logger, req, res) {
  const registrar = req.srf.locals.registrar;
  const registration = req.registration;
  const uri = parseUri(registration.aor);
  const aor = `${uri.user}@${uri.host}`;
  let expires = registration.expires;
  const grantedExpires = expires;
  let contactHdr = req.get('Contact');

  // reduce the registration interval if the device is behind a nat
  if (isUacBehindNat(req)) {
    expires = NAT_EXPIRES;
    contactHdr = contactHdr.replace(/expires=\d+/, `expires=${expires}`);
  }
  const opts = {
    contact: req.getParsedHeader('Contact')[0].uri,
    sbcAddress: req.server.hostport,
    protocol: getSipProtocol(req),
    proxy: `sip:${req.source_address}:${req.source_port}`
  };
  const result = await registrar.add(aor, opts, grantedExpires);
  debug(`result ${result} from adding ${JSON.stringify(opts)}`);
  logger.debug(`successfully registered ${aor}`);

  res.send(200, {
    headers: {
      'Contact': contactHdr,
      'Expires': expires
    }
  });
}

async function unregister(logger, req, res) {
  const registrar = req.srf.locals.registrar;
  const uri = parseUri(req.registration.aor);
  const aor = `${uri.user}@${uri.host}`;
  const result = await registrar.remove(aor);

  logger.debug({result}, `successfully unregistered ${req.registration.aor}`);

  res.send(200, {
    headers: {
      'Contact': req.get('Contact'),
      'Expires': 0
    }
  });
}
