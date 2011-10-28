var reserve_callback = function(job, del){
  del();  
};

var opts ={
  reserve_tube : 'test',
  put_tube : 'test',
  reserve_callback : reserve_callback,
  pool_size : 200,
  log_output : true,
  json_encoding : true 
};

var bspool = require('../index.js').build(opts);

bspool.init(function(){
  var attempt = 1000; 
  var completed = 0;
  for (var i = 0 ; i < 1000 ; i++){
    bspool.put({"job": i }, function(){
      completed += 1;
      if (completed===attempt){
        console.error('TEST PASSED :-)');
        process.exit();
      }
    });
  }

});
