const test = require('blue-tape') ;
const exec = require('child_process').exec ;
const async = require('async');

test('starting docker network..', (t) => {
  exec(`docker-compose -f ${__dirname}/docker-compose.yaml up -d`, (err, stdout, stderr) => {
    t.pass('docker network is up');
    t.end(err);
  });
  
});

  
