var assert = require('assert');

var PV = require('../index');

describe('persistent vector', function() {
  it('converts arrays to vectors and back', function() {
    var v1 = new PV(1, 2, 3, 4, 5);
    assert.deepEqual(v1.toArray(), [1, 2, 3, 4, 5]);
  });

  it('equals other persistent vectors with same values', function() {
    var v1 = new PV(1, 2, 3);
    assert(v1.equals(new PV(1, 2, 3)));
  });

  it('supports non-destructive pushing', function() {
    var v1 = new PV(10, 11, 12);
    var v2 = v1.push(99);
    assert.deepEqual(v2.toArray(), [10, 11, 12, 99]);
    assert.deepEqual(v1.toArray(), [10, 11, 12]);
  });

  it('can be sliced', function() {
    var vec = new PV('a', 'b', 'c', 'd');
    assert(vec.slice(2).equals(new PV('c', 'd')));
    assert(vec.slice(0, 1).equals(new PV('a')));
  });

  it('knows its length', function() {
    var vec = new PV('first', 'second', 'third');
    assert(vec.length === 3);
    assert(vec.slice(1).length === 2);
    assert(vec.push('fourth').length === 4);
  });

  it('can be indexed', function() {
    var vec = new PV('first', 'second', 'third');
    assert(vec.get(0) === 'first');
    assert(vec.get(1) === 'second');
    assert(vec.get(2) === 'third');
  });

  it('can be "set"', function() {
    var v1 = new PV('first', 'second', 'third');
    var v2 = v1.set(0, '1st');
    var v3 = v2.set(1, '2nd').set(2, '3rd');
    assert(v1.equals(new PV('first', 'second', 'third')));
    assert(v2.equals(new PV('1st', 'second', 'third')));
    assert(v3.equals(new PV('1st', '2nd', '3rd')));
  });

  it('can be "popped", removing the last element', function() {
    var v1 = new PV(200, 303, 404);
    var v2 = v1.pop();
    assert(v1.equals(new PV(200, 303, 404)));
    assert(v2.equals(new PV(200, 303)));
  });

  it('can have two thousand things pushed into it', function() {
    var array = [];
    var vec = new PV();
    for (var i = 0; i < 2000; i++) {
      array.push(i);
      vec = vec.push(i);
    }
    for (i = 0; i < 2000; i++) {
      assert.equal(vec.get(i), array[i]);
    }
  });
});
