var bspool = require('../index.js');

bspool.emitter.on('newjob', function(job, del){
  del();
});

bspool.emitter.on('log', function(level, msg){
  console.log(msg);
});

var opts = {
  resTube : 'test',
  putTube : 'test',
  log_output : true ,
  pool_size : 100
};

bspool.init(opts, function(){
  var attempt = 1000; 
  var completed = 0;
  
  for (var i = 0 ; i < 1000 ; i++){
    bspool.put({"job": i }, function(){
      completed += 1;
      if (completed===attempt){
        console.error('PUT 1000');
      }
    });
  }
});
