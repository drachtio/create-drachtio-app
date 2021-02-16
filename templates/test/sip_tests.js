const test = require('blue-tape');
const { sippUac } = require('./sipp')('test_drachtio');
const clearModule = require('clear-module');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

function connect(connectable) {
  return new Promise((resolve, reject) => {
    connectable.on('connect', () => {
      return resolve();
    });
  });
}

test('sip tests', async(t) => {
  clearModule.all();
  const {srf, disconnect} = require('../app');

  try {
    await connect(srf);
{% if handleInvite %}
    await sippUac('uac.xml', '172.32.0.10');
    t.pass('invite test passes');
{% endif %}
{% if handleRegister %}
    await sippUac('uac-register-auth-success.xml', '172.32.0.10', 'good_user.csv');
    t.pass('register test passes');
{% endif %}
{% if handleSubscribe %}
    await sippUac('uac-subscribe-expect-480.xml', '172.32.0.10');
    t.pass('subscribe test passes');
{% endif %}
{% if handlePublish %}
    await sippUac('uac-publish-expect-480.xml', '172.32.0.10');
    t.pass('publish test passes');
{% endif %}
{% if handleMessage %}
    await sippUac('uac-message-expect-480.xml', '172.32.0.10');
    t.pass('message test passes');
{% endif %}
{% if handleOptions %}
    await sippUac('uac-options-expect-200.xml', '172.32.0.10');
    t.pass('options test passes');
{% endif %}
{% if handleInfo %}
    await sippUac('uac-info-expect-480.xml', '172.32.0.10');
    t.pass('info test passes');
{% endif %}
    disconnect();
  } catch (err) {
    console.log(`error received: ${err}`);
    disconnect();
    t.error(err);
  }
});
