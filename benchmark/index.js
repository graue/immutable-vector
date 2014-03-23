var PV;

var changeStuffSuite = function(impl) {
  return function() {
    var vec10k;
    var length = 10000;

    before(function() {
      PV = impl;
      vec10k = new PV();
      for (var i = 0; i < length; i++) {
        vec10k = vec10k.push(Math.floor(Math.random()*100));
      }
    });

    bench('change the first element 1000 times', function() {
      var vec = vec10k;
      for (var i = 0; i < 1000; i++) {
        vec = vec.set(0, i&1);
      }
    });

    bench('change the last element 1000 times', function() {
      var vec = vec10k;
      for (var i = 0; i < 1000; i++) {
        vec = vec.set(length-1, i&1);
      }
    });

    bench('add 500 new elements to the end', function() {
      var vec = vec10k;
      for (var i = 0; i < 500; i++) {
        vec = vec.push(i&1);
      }
    });
  };
};

suite('changing stuff with naive impl',
      changeStuffSuite(require('../impls/naive')));

suite('changing stuff with vector trie',
      changeStuffSuite(require('../impls/vectorTrie')));

suite('changing stuff with bit trie',
      changeStuffSuite(require('../impls/bitTrie')));
