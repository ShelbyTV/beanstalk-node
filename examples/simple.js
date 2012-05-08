/*
 * Puts 1000 jobs on a tube ('test') and deletes them
 */

var bspool = require('../index.js');
var ATTEMPT  = 1000; 
var JOBS_PUT = 0; 
var JOBS_DELETED = 0;


var put_callback = function(){
  JOBS_PUT += 1;
  if (JOBS_PUT===ATTEMPT){
    console.log('ALL JOBS PUT'); 
  }
};

var newjob_callback = function(job, delete_job){
  delete_job();  //this is also async
  JOBS_DELETED+=1;
  if (JOBS_DELETED===ATTEMPT){
    console.log('ALL JOBS DELETED'); 
  }
};

var log_callback = function(log_level, msg){
  console.log(msg);
};

bspool.emitter.on('newjob', newjob_callback);

bspool.emitter.on('log', log_callback);

var opts = {
  resTube : 'test', // the reserve tube - 
  putTube : 'test', // the put tube
  log_output : true , // whether or not emitter.on('log' -- will have any noise
  pool_size : 100, // number of clients to maintain
};

bspool.init(opts, function(){
  for (var i = 0 ; i < ATTEMPT ; i++){
    if (i%2){
      bspool.put({"job": i }, put_callback);
    } else {
      bspool.put({"job": i }, put_callback, 'test-2', false);
    }
  }
});
