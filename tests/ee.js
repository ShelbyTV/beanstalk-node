var EE2 = require('eventemitter2').EventEmitter2;

var house = {};
house.emitter = new EE2();

house.emitter.on('foo', function(){
  console.log('got foo', arguments);
});

house.emitter.emit('foo');
