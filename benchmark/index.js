var PV;
var wrap = require('../wrap');

var changeStuffSuite = function(impl) {
  impl = wrap(impl);
  return function() {
    var vec10k;
    const length = 10000;
    const repCount = 1000; // should be less than length

    before(function() {
      PV = impl;
      vec10k = new PV();
      for (var i = 0; i < length; i++) {
        vec10k = vec10k.push(Math.floor(Math.random()*length));
      }
    });

    bench('set first element repeatedly', function() {
      var vec = vec10k;
      for (var i = 0; i < repCount; i++) {
        vec = vec.set(0, i&1);
      }
    });

    bench('set last element repeatedly', function() {
      var vec = vec10k;
      for (var i = 0; i < repCount; i++) {
        vec = vec.set(length-1, i&1);
      }
    });

    bench('push elements', function() {
      var vec = vec10k;
      for (var i = 0; i < repCount; i++) {
        vec = vec.push(i&1);
      }
    });

    bench('pop elements', function() {
      var vec = vec10k;
      for (var i = 0; i < repCount; i++) {
        vec = vec.pop();
      }
    });

    bench('get random elements', function() {
      // This test exploits that each element's value in vec10k is also
      // a valid index.
      var index = length / 2;
      for (var i = 0; i < repCount; i++) {
        var newIndex = vec10k.get(index);
        if (newIndex === index) newIndex++;
        index = newIndex;
      }
      // Following is just to prevent above loop from getting optimized away.
      if (index < 0) throw new Error('this will never happen');
    });

    bench('get sequential elements', function() {
      // Flag is to prevent the whole loop getting optimized away.
      var flag = true;

      // Start at a random location
      var start = Math.floor(Math.random() * (length - repCount));
      var end = start + repCount;

      for (var i = start; i <= end; i++) {
        if (vec10k.get(i) < 0) {
          flag = false;
        }
      }

      if (!flag) throw new Error('this will never happen');
    });
  };
};

suite('changing stuff with bit trie',
      changeStuffSuite(require('../impls/bitTrie')));

suite('changing stuff with vector trie',
      changeStuffSuite(require('../impls/vectorTrie')));
