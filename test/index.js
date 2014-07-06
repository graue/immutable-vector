var assert = require('assert');

var IV = require('../index');

describe('immutable vector', function() {
  it('converts arrays to vectors and back', function() {
    var v1 = new IV(1, 2, 3, 4, 5);
    assert.deepEqual(v1.toArray(), [1, 2, 3, 4, 5]);
  });

  it('supports non-destructive pushing', function() {
    var v1 = new IV(10, 11, 12);
    var v2 = v1.push(99);
    assert.deepEqual(v2.toArray(), [10, 11, 12, 99]);
    assert.deepEqual(v1.toArray(), [10, 11, 12]);
  });

  it('can be sliced', function() {
    var vec = new IV('a', 'b', 'c', 'd');
    assert(vec.slice(2).equals(new IV('c', 'd')));
    assert(vec.slice(0, 1).equals(new IV('a')));
  });

  it('knows its length', function() {
    var vec = new IV('first', 'second', 'third');
    assert(vec.length === 3);
    assert(vec.slice(1).length === 2);
    assert(vec.push('fourth').length === 4);
  });

  it('can be indexed', function() {
    var vec = new IV('first', 'second', 'third');
    assert(vec.get(0) === 'first');
    assert(vec.get(1) === 'second');
    assert(vec.get(2) === 'third');
  });

  it('can be "set"', function() {
    var v1 = new IV('first', 'second', 'third');
    var v2 = v1.set(0, '1st');
    var v3 = v2.set(1, '2nd').set(2, '3rd');
    assert(v1.equals(new IV('first', 'second', 'third')));
    assert(v2.equals(new IV('1st', 'second', 'third')));
    assert(v3.equals(new IV('1st', '2nd', '3rd')));
  });

  it('can be "popped", removing the last element', function() {
    var v1 = new IV(200, 303, 404);
    var v2 = v1.pop();
    assert(v1.equals(new IV(200, 303, 404)));
    assert(v2.equals(new IV(200, 303)));
  });

  it('can have two thousand things pushed into it', function() {
    var array = [];
    var vec = new IV();
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
    var vec = new IV(42, 999, 23);
    assert.equal(vec.peek(), 23);
  });

  it('returns undefined if array empty', function() {
    assert.equal(new IV().peek(), undefined);
  });
});

function range(length) {
  var vec = new IV();
  for (var i = 0; i < length; i++) {
    vec = vec.push(i);
  }
  return vec;
}

describe('popping', function() {
  it('works on empty vectors', function() {
    var vec = new IV();
    assert(vec.equals(vec.pop()));
  });

  it('works on size-1 vectors', function() {
    var vec = new IV('foobar');
    assert(vec.pop().equals(new IV()));
  });

  it('works when leaf node stays non-empty', function() {
    assert(new IV(1, 2).pop().equals(new IV(1)));
    assert(range(32).pop().equals(range(31)));
    assert(range(34).pop().equals(range(33)));
    assert(range(66).pop().equals(range(65)));
  });

  it('works when a leaf node must be removed', function() {
    assert(range(65).pop().equals(range(64)));
    assert(range(96).equals(range(97).pop()));
  });

  it('works when the entire root is being changed', function() {
    assert(range(33).pop().equals(range(32)));
    assert(range(1024).equals(range(1025).pop()));
  });

  it('can pop a big vector all the way to empty', function() {
    var vec = range(2000);
    for (var i = 0; i < 1999; i++) {
      vec = vec.pop();
    }
    assert(new IV(0).equals(vec));
    assert(new IV().equals(vec.pop()));
  });
});

describe('vector equality', function() {
  it('is true for vectors with same values', function() {
    assert(new IV('a', 'b', 3).equals(new IV('a', 'b', 3)));
    assert(new IV().equals(new IV()));
    var v1 = new IV(1, 2, 3, 4, 5).pop();
    var v2 = new IV(1, 2, 3).push(4);
    assert(v1.equals(v2));
  });

  it('is false for vectors with different values', function() {
    assert(!new IV('a', 'b', 3).equals(new IV('a', 'b', 4)));
    assert(!new IV(9, 8, 7).equals(new IV(9, 8, 7, 6)));
    assert(!new IV().equals(new IV(1)));
  });

  it('recurses into vector elements', function() {
    var vov1 = new IV(new IV(1, 2), new IV(3, 4));
    var vov2 = new IV(new IV(1).push(2), new IV(3).push(4));
    var vov3 = new IV(new IV(1, 2), new IV(3, 3));
    assert(vov1.equals(vov2));
    assert(vov2.equals(vov1));
    assert(!vov1.equals(vov3));
  });

  it('uses object equality if mutable collections are elements', function() {
    // Note: Putting mutable collections into immutable ones is not
    // recommended as it can lead to confusion. Nevertheless, this guarantee
    // (that if you *do* insert a mutable collection, object equality is used)
    // is intended to be part of the API contract.
    var a1 = [], a2 = [];
    var v1 = new IV(a1, a2);
    assert(v1.equals(new IV(a1, a2)));
    assert(!v1.equals(new IV(a1, a1)));
  });
});

describe('a vector slice', function() {
  var vec, slice;

  beforeEach(function() {
    vec = new IV('a', 'b', 'c', 'd', 'e');
    slice = vec.slice(2, 4); // ['c', 'd']
  });

  it('equals a normal vector with same elements', function() {
    assert(slice.equals(new IV('c', 'd')));
  });

  it('supports get', function() {
    assert.equal(slice.get(0), 'c');
    assert.equal(slice.get(1), 'd');
  });

  it('can be non-destructively set', function() {
    var slice2 = slice.set(0, 'cc');
    var slice3 = slice2.set(1, 'dd');
    assert(slice3.equals(new IV('cc', 'dd')));
    assert(slice2.equals(new IV('cc', 'd')));
    assert(slice.equals(new IV('c', 'd')));
    assert(vec.equals(new IV('a', 'b', 'c', 'd', 'e')));
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
    assert(slice2.equals(new IV('c')));
    assert(slice.equals(new IV('c', 'd')));
    assert(vec.equals(new IV('a', 'b', 'c', 'd', 'e')));
    assert.equal(slice2.get(1), undefined);
  });

  it('can be non-destructively pushed', function() {
    var slice2 = slice.push('new');
    assert(slice2.equals(new IV('c', 'd', 'new')));
    assert(slice.equals(new IV('c', 'd')));
    assert(vec.equals(new IV('a', 'b', 'c', 'd', 'e')));
    assert.equal(slice2.get(2), 'new');
    assert.equal(slice.get(2), undefined);
  });

  it('can be sliced again', function() {
    assert(slice.equals(slice.slice(0, 2)));
    assert(slice.slice(0, 1).equals(new IV('c')));
    assert(slice.slice(1, 2).equals(new IV('d')));
    assert(slice.slice(1, 1).equals(new IV()));
  });
});

describe('vector foreach', function() {
  it('calls callback once per element', function() {
    var calledArgs = [];
    var vec = new IV(1, 3, 5, 'pants', 1.4, undefined, null, true, 0);
    vec.forEach(function(val) {
      calledArgs.push(val);
    });
    assert.deepEqual(vec.toArray(), calledArgs);
  });
});

describe('from constructor', function() {
  it('creates vectors from arrays', function() {
    var array = [1, 3, 5, 7];
    var vec = IV.from(array);
    assert(vec.equals(new IV(1, 3, 5, 7)));
  });

  it('works right on falsy values', function() {
    var array = [1, 3, 5, 'pants', 1.4, undefined, null, true, 0];
    var vec = IV.from(array);
    assert.deepEqual(vec.toArray(), array);
  });

  it('creates an empty vector if array is empty', function() {
    assert.deepEqual(IV.from([]).toArray(), []);
  });

  it('puts undefineds in for missing elements in a sparse array', function() {
    var unfilledArray = new Array(8);
    unfilledArray[4] = 'yes';
    assert.deepEqual(IV.from(unfilledArray).toArray(),
      [void 0, void 0, void 0, void 0, 'yes', void 0, void 0, void 0]);
  });

  it('creates vectors from array-likes', function() {
    var arrayLike = {length: 3};
    arrayLike[0] = 'first';
    arrayLike[1] = 'second';
    arrayLike[2] = 'third';
    assert.deepEqual(IV.from(arrayLike).toArray(),
      ['first', 'second', 'third']);
  });
});

describe('map', function() {
  it('applies a function to each value', function() {
    var vec = new IV(5, 10, 15, 'foo', -2);
    var mapped = vec.map(function(n) { return n + 3; });
    assert(mapped.equals(new IV(8, 13, 18, 'foo3', 1)));
  });

  it('optionally passes a this argument', function() {
    var vec = new IV(2, 9, 10);
    var myObj = {
      multiplier: 3,
      multiply: function(n) {
        return this.multiplier * n;
      }
    };
    var mapped = vec.map(myObj.multiply, myObj);
    assert(mapped.equals(new IV(6, 27, 30)));
  });
});

describe('filter', function() {
  it('removes values that fail a predicate', function() {
    var vec = new IV(8, 7, 6, 5, 4);
    var filtered = vec.filter(function(n) {
      return n % 2 === 0;
    });
    assert(filtered.equals(new IV(8, 6, 4)));
  });

  it('passes the zero-based index', function() {
    var vec = new IV(0, 52, 2, 97, 89, 5);
    var filtered = vec.filter(function(n, idx) {
      return n !== idx;
    });
    assert(filtered.equals(new IV(52, 97, 89)));
  });

  it('optionally passes a this argument', function() {
    var vec = new IV(10, 9, 8, 7, 6, 5, 4, 3, 2, 1);
    var myObj = {
      allowedValues: [3, 4, 10, 20],
      filterFunc: function(n) {
        return this.allowedValues.indexOf(n) !== -1;
      }
    };
    var filtered = vec.filter(myObj.filterFunc, myObj);
    assert(filtered.equals(new IV(10, 4, 3)));
  });
});

function sum(a, b) {
  return a + b;
}

describe('reduce', function() {
  it('applies a function to an accumulator and each value', function() {
    var vec = new IV(5, 30, 900, 1337);
    assert.strictEqual(vec.reduce(sum), 5 + 30 + 900 + 1337);
  });

  it('optionally takes an initial value', function() {
    var vec = new IV(5, 30, 900, 1337);
    var initial = -1337;
    assert.strictEqual(vec.reduce(sum, initial), 935);
  });

  it('can be called on empty vector with an initial value', function() {
    assert.strictEqual(new IV().reduce(sum, 0), 0);
  });

  it('throws if called on empty vector with no initial value', function() {
    assert.throws(function() {
      return new IV().reduce(sum);
    }, TypeError);
  });
});

describe('indexOf', function() {
  var fruits = new IV('apple', 'banana', 'cherry', 'apple', 'grape');

  it('returns first index at which a value appears', function() {
    assert.strictEqual(fruits.indexOf('apple'), 0);
    assert.strictEqual(fruits.indexOf('banana'), 1);
    assert.strictEqual(fruits.indexOf('cherry'), 2);
    assert.strictEqual(fruits.indexOf('grape'), 4);
  });

  it('returns -1 if the value is not found', function() {
    assert.strictEqual(fruits.indexOf('tomato'), -1);
    assert.strictEqual(new IV().indexOf('foo'), -1);
  });

  it('takes an optional start index', function() {
    assert.strictEqual(fruits.indexOf('apple', 1), 3);
    assert.strictEqual(fruits.indexOf('apple', 0), 0);
    assert.strictEqual(fruits.indexOf('apple', 4), -1);
    assert.strictEqual(fruits.indexOf('apple', 53), -1);
  });

  it('compares nested vectors by value', function() {
    var nested = new IV(new IV(1, 2), new IV(3, 4), new IV(5, new IV(6, 7)));
    assert.strictEqual(nested.indexOf(new IV(1, 2)), 0);
    assert.strictEqual(nested.indexOf(new IV(3, 4)), 1);
    assert.strictEqual(nested.indexOf(new IV(5, new IV(6, 7))), 2);
    assert.strictEqual(nested.indexOf(new IV(6, 7)), -1);
  });
});
