let fs = require('fs');
let configPath = './config.public.js';

// config.private.js first
if (fs.existsSync('./config.private.js')) {
  configPath = './config.private.js';
}

module.exports = require(configPath);
