/* 
 * Beanstalk Client Pool
 */

module.exports = {

  /* Attrs : assigned by factory
   * -----
   * resTube : the tube to watch 
   * putTube : the tube to put to
   * reserve_callback : job reserved callback
   * respool : pool of beanstalk clients
   * log_output : should I log output?
   * config : config object
   * json_encoding
   * beanstalk_client 
   */

  init : function(cb){
    var self = this;
    self.poolect(function(){
      self.reserve();
      cb();
    });
  },
  
  poolect : function(callback){
    var self = this;
    var beanstalk_uri = self.config.beanstalk.uri+':'+self.config.beanstalk.port;
    var num_clients = self.pool_size;
    for (var i=0; i<num_clients; i+=1){
      self.beanstalk_client.connect(beanstalk_uri, function(err, conn){
        self.respool.addResource(conn, function(err, res){
          if (self.respool.pool.length===num_clients){
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
          self.log('GOT JOB:', job_id);
          self.reserve();
          job = self.json_encoding ? JSON.parse(job) : decodeURIComponent(JSON.parse(job));
          self.reserve_callback(job, function(){
            cl.destroy(job_id, function(err ,res){
              self.log('DELETED JOB:', job_id);
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
        job = self.json_encoding ? JSON.stringify(job) : encodeURIComponent(JSON.stringify(job));
        self.log('PUTTING JOB', '');
        cl.put(0, 0, 10000, job, function(err, job_id){
          self.log('PUT JOB:', job_id);
          self.respool.freeResource(cl, function(err, res){
            return callback(null, 'OK');
          });
        });
      });
    });
  },

  log : function(msg, id){
    if (this.log_output){
      console.log(msg, id);
    }
  }
};
