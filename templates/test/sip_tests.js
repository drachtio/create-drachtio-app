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
    await sippUac('uac.xml', '172.32.0.10');
    t.pass('call successfully completes');

    disconnect();
  } catch (err) {
    console.log(`error received: ${err}`);
    disconnect();
    t.error(err);
  }
});
