#!/usr/bin/env node

const nunjucks = require('nunjucks');
const { program } = require('commander');
const {spawn} = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const methods = [
  'invite',
  'register',
  'subscribe',
  'message',
  'publish',
  'options',
  'info',
  'all'
];
const baseFiles = ['package.json', 'app.js', '.eslintrc.json', '.eslintignore', '.gitignore', 'README.md'];
const pluginFiles = {
  invite: ['call-session.js', 'middleware.js'],
  register: ['middleware.js', 'register.js', 'utils.js'],
  subscribe: ['subscribe.js'],
  options: ['options.js'],
  info: ['info.js'],
  publish: ['publish.js'],
  message: ['message.js']
};

program.version('0.0.3', '-v, --version', 'display the current version');
program
.name('create-drachtio-app')
.usage('[options] project-name')
.addHelpText('after', `

Example:
  $ create-drachtio-app -m -t -r invite register subscribe my-app`)
.option('-m, --media', 'include the drachtio-fsmrf pckage for media control')
.option('-r, --request-types <methods...>', 'list the SIP request types to handle, or \'all\'; e.g. invite register...', ['invite'])
.option('-t, --test', 'generate a docker-based test suite')

program.parse();
const opts = program.opts();
opts.requestTypes = (opts.requestTypes || []).map((r) => r.toLowerCase());

const extra = opts.requestTypes.filter((r) => !methods.includes(r));
const folder = extra.length ? extra[0] : (program.args.length ? program.args[0] : null);
const includeAll = opts.requestTypes.includes('all');
if (!folder) program.help();

const cwd = process.cwd();
const target = `${cwd}/${folder}`;

/* don't overwrite */
if (fs.existsSync(target)) {
  console.log(`folder ${folder} exists; please specify a new folder to create`);
  process.exit(0);
}

console.log();
console.log(`Creating a new drachtio app in ${chalk.green(target)}`);
console.log();

fs.mkdirSync(folder);
process.chdir(folder);

const appName = folder;

nunjucks.configure(`${__dirname}/../templates`, {
  lstripBlocks: true,
  trimBlocks: true
});

const shouldRender = (template) => {
  if (baseFiles.includes(template)) return true;
  const baseName = path.basename(template);
  for (const prop in pluginFiles) {
    if ((opts.requestTypes.includes(prop) || includeAll) &&
      pluginFiles[prop].includes(baseName)) return true;
  }
  return false;
};

const renderFolder = (folder, target, inTest = false) => {
  const entries = fs.readdirSync(folder, {withFileTypes: true});
  for (const entry of entries) {
    if (entry.isFile()) {
      if (inTest || shouldRender(entry.name)) {
        fs.writeFileSync(`${target}/${entry.name}`, nunjucks.render(`${folder}/${entry.name}`, {
          appName,
          media: opts.media,
          test: opts.test,
          handleInvite: opts.requestTypes.includes('invite') || includeAll,
          handleRegister: opts.requestTypes.includes('register') || includeAll,
          handleSubscribe: opts.requestTypes.includes('subscribe') || includeAll,
          handleOptions: opts.requestTypes.includes('options') || includeAll,
          handleInfo: opts.requestTypes.includes('info') || includeAll,
          handlePublish: opts.requestTypes.includes('publish') || includeAll,
          handleMessage: opts.requestTypes.includes('message') || includeAll
        }));    
      }
    }
    else if (entry.isDirectory()) {
      if (entry.name !== 'test' || opts.test) {
        fs.mkdirSync(`${target}/${entry.name}`);
        renderFolder(`${folder}/${entry.name}`, `${target}/${entry.name}`,
          entry.name === 'test' || inTest);  
      }
    }
  } 
}

const spawnCommand = (cmd, args) => {
  return new Promise((resolve, reject) => {
    const child_process = spawn(cmd, args, {stdio: ['inherit', 'pipe', 'pipe']});

    child_process.on('exit', (code, signal) => {
      if (code === 0) {
        return resolve();
      }
      reject(code);
    });
    child_process.on('error', (error) => {
      console.log(`error spawning child process for docker: ${args}`);
    });

    child_process.stdout.on('data', (data) => {
      //console.log(data.toString());
    });
    child_process.stderr.on('data', (data) => {
      //console.log(data.toString());
    });
  });

};

(async() => {

  renderFolder(`${__dirname}/../templates`, process.cwd());

  const packages = ['drachtio-srf', 'pino', 'debug'];
  const devPackages = ['eslint-plugin-promise', 'eslint'];
  if (opts.media) {
    Array.prototype.push.apply(packages, ['drachtio-fsmrf']);
  }
  if (opts.requestTypes.includes('register') || includeAll) {
    Array.prototype.push.apply(packages, [
      'drachtio-mw-registration-parser',
      'drachtio-mw-digest-auth',
      '@jambonz/mw-registrar']);
  }
  if (opts.test) {
    Array.prototype.push.apply(devPackages, ['blue-tape', 'nyc', 'tap-spec', 'clear-module', 'async']);
  }
  
  console.log('Installing packages.  This might take a few seconds...');
  await spawnCommand('npm', 
    ['install', '--loglevel=error', '--save']
    .concat(packages));
  await spawnCommand('npm', 
    ['install', '--loglevel=error', '--save-dev']
    .concat(devPackages));
  
})();
