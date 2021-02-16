const nunjucks = require('nunjucks');
const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const { openStdin } = require('process');
const cwd = process.cwd();

program.version('0.0.1', '-v, --version', 'display the current version');
program
.option('-f, --folder <folderName>', 'create the named folder and scaffold the application there')
.option('-m, --media', 'include the drachtio-fsmrf pckage for media control')
.option('--redis', 'use redis for registration database')
.option('-t, --test', 'generate a docker-based test suite')
.requiredOption('-r, --request-types <methods...>', 'list the SIP request types to handle; e.g. invite register...')

program.parse();
const opts = program.opts();
opts.requestTypes = opts.requestTypes.map((r) => r.toLowerCase());

nunjucks.configure(`${__dirname}/templates`, {
  lstripBlocks: true,
  trimBlocks: true
});

/* don't overwrite */
if (opts.folder) {
  if (fs.existsSync(`${cwd}/${opts.folder}`)) {
    console.log(`folder ${opts.folder} exists; please specify a new folder to create`);
    process.exit(0);
  }
  fs.mkdirSync(opts.folder);
  process.chdir(opts.folder);
}
else if (fs.existsSync(`${cwd}/package.json`)) {
  console.log('package.json already exists; please run this in an empty directory');
  process.exit(0);
}

const baseFiles = ['package.json', 'app.js', '.eslintrc.json', '.eslintignore'];
const pluginFiles = {
  invite: ['call-session.js', 'middleware.js'],
  register: ['register.js', 'registrar.js'],
  subscribe: ['subscribe.js'],
  options: ['options.js'],
  publish: ['publish.js'],
  message: ['message.js']
};

const shouldRender = (template) => {
  if (baseFiles.includes(template)) return true;
  const baseName = path.basename(template);
  for (const prop in pluginFiles) {
    if (opts.requestTypes.includes(prop) && pluginFiles[prop].includes(baseName)) return true;
  }
  return false;
};

const renderFolder = (folder, target, inTest = false) => {
  const entries = fs.readdirSync(folder, {withFileTypes: true});
  for (const entry of entries) {
    if (entry.isFile()) {
      if (inTest || shouldRender(entry.name)) {
        fs.writeFileSync(`${target}/${entry.name}`, nunjucks.render(`${folder}/${entry.name}`, {
          appName: opts.folder,
          media: opts.media,
          test: opts.test,
          handleInvite: opts.requestTypes.includes('invite'),
          handleRegister: opts.requestTypes.includes('register'),
          handleSubscribe: opts.requestTypes.includes('subscribe'),
          handlePublish: opts.requestTypes.includes('publish'),
          handleMessage: opts.requestTypes.includes('message')
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


renderFolder(`${__dirname}/templates`, process.cwd());
