/*
 * Beanstalk Client Pool Factory
 */

var BSPool = require('./bspool.js');
var respool = require('respool');
var beanstalk_client = require('beanstalk_client').Client;
var config = require('shelby-config')[process.env.NODE_ENV];

exports.build = function(options){
  var bspool = Object.create(BSPool);
  Object.keys(options).forEach(function(key){
    bspool[key] = options[key];
  });
  bspool.respool = respool.createPool();
  bspool.beanstalk_client = beanstalk_client;
  bspool.config = config;
  return bspool;
};
