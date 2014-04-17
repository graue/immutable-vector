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

describe('peek', function() {
  it('returns the last element of the array', function() {
    var vec = new PV(42, 999, 23);
    assert.equal(vec.peek(), 23);
  });

  it('returns undefined if array empty', function() {
    assert.equal(new PV().peek(), undefined);
  });
});

describe('a vector slice', function() {
  var vec, slice;

  beforeEach(function() {
    vec = new PV('a', 'b', 'c', 'd', 'e');
    slice = vec.slice(2, 4); // ['c', 'd']
  });

  it('equals a normal vector with same elements', function() {
    assert(slice.equals(new PV('c', 'd')));
  });

  it('supports get', function() {
    assert.equal(slice.get(0), 'c');
    assert.equal(slice.get(1), 'd');
  });

  it('can be non-destructively set', function() {
    var slice2 = slice.set(0, 'cc');
    var slice3 = slice2.set(1, 'dd');
    assert(slice3.equals(new PV('cc', 'dd')));
    assert(slice2.equals(new PV('cc', 'd')));
    assert(slice.equals(new PV('c', 'd')));
    assert(vec.equals(new PV('a', 'b', 'c', 'd', 'e')));
  });

  it("won't let you set out of range", function() {
    assert.throws(function() { slice.set(-1, 'bbb'); });
    assert.throws(function() { slice.set(2, 'eee'); });
  });

  it('returns undefined if you get out of range', function() {
    assert.equal(slice.get(-1), undefined);
    assert.equal(slice.get(2), undefined);
  });

  it('can be non-destructively popped', function() {
    var slice2 = slice.pop();
    assert(slice2.equals(new PV('c')));
    assert(slice.equals(new PV('c', 'd')));
    assert(vec.equals(new PV('a', 'b', 'c', 'd', 'e')));
    assert.equal(slice2.get(1), undefined);
  });

  it('can be non-destructively pushed', function() {
    var slice2 = slice.push('new');
    assert(slice2.equals(new PV('c', 'd', 'new')));
    assert(slice.equals(new PV('c', 'd')));
    assert(vec.equals(new PV('a', 'b', 'c', 'd', 'e')));
    assert.equal(slice2.get(2), 'new');
    assert.equal(slice.get(2), undefined);
  });

  it('can be sliced again', function() {
    assert(slice.equals(slice.slice(0, 2)));
    assert(slice.slice(0, 1).equals(new PV('c')));
    assert(slice.slice(1, 2).equals(new PV('d')));
    assert(slice.slice(1, 1).equals(new PV()));
  });
});
