/*
 * beanstalk-node 
 */

if (!process.env.NODE_ENV){
  console.error('Specify NODE_ENV');
  process.exit();
}

var factory = require('factory-node');
var _super = require('./lib/bspool.js');
module.exports = factory.build(_super);
