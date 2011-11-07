/* 
 * Beanstalk Client Pool
 */

var EE2 = require('eventemitter2').EventEmitter2;

module.exports = {

  pool_size : 200,
  config : require('shelby-config')[process.env.NODE_ENV].beanstalk,
  beanstalk_client : require('beanstalk_client').Client,
  respool : require('respool').createPool(),
  emitter :  new EE2(),
  //json_only : (process.env.NODE_ENV==='development') ? true : false,

  init : function(opts, cb){
    var self = this;
    if (!(opts.resTube && opts.putTube)){
      console.error('Options must have res_tube and put_tube defined');
      process.exit();
    }

    Object.keys(opts).forEach(function(k){
      self[k] = opts[k];  
    });

    var self = this;
    this.poolect(function(){
      self.reserve();
      cb();
    });
  },
  
  poolect : function(callback){
    var self = this;
    var beanstalk_uri = self.config.uri+':'+self.config.port;
    var num_clients = self.pool_size;
    for (var i=0; i<num_clients; i+=1){
      self.beanstalk_client.connect(beanstalk_uri, function(err, conn){
        self.respool.addResource(conn, function(err, res){
          if (self.respool.pool.length==num_clients){
            return callback(null, 'OK');
          }    
        });
      });  
    } 
  },
    
  reserve : function(){
    var self = this;
    self.respool.getResource(function(err, cl){
      cl.watch(self.resTube, function(err, res){
        cl.reserve(function(err, job_id, job){
          self.emitter.emit('log', 0, 'got job : '+job_id);
          self.reserve();
          job = JSON.parse(job);
          self.emitter.emit('newjob', job, function(){
            cl.destroy(job_id, function(err ,res){
              self.emitter.emit('log', 0, 'del job : '+job_id);
              self.respool.freeResource(cl, function(err, res){
                return;
              });
            });
          });
        });
      });
    });
  },
  
  put : function(job, callback){
    var self = this;
    self.respool.getResource(function(err, cl){
      cl.use(self.putTube, function(err, res){
        job = encodeURIComponent(JSON.stringify(job));
        cl.put(0, 0, 10000, job, function(err, job_id){
          self.emitter.emit('log', 0, 'put job : '+job_id);
          self.respool.freeResource(cl, function(err, res){
            return callback(null, 'OK');
          });
        });
      });
    });
  },

};
