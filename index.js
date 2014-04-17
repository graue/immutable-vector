var ImmutableVector = require('./impls/bitTrie');

// Add convenience methods.

ImmutableVector.prototype.peek || (ImmutableVector.prototype.peek =
function() {
  return this.get(this.length - 1);
});

// Make slice faster.
var ImmutableVectorSlice = function() {};
ImmutableVectorSlice.prototype = new ImmutableVector();

function sanitizeSliceParams(length, begin, end) {
  if (begin === undefined || typeof begin !== 'number' || begin < 0) {
    begin = 0;
  }
  if (end === undefined || typeof end !== 'number' || end > length) {
    end = length;
  }
  if (end < begin) end = begin;
  return [begin, end];
}

ImmutableVector.prototype.slice = function(begin, end) {
  var beginEnd = sanitizeSliceParams(this.length, begin, end);
  begin = beginEnd[0];
  end = beginEnd[1];

  var slice = new ImmutableVectorSlice();
  slice._vec = this;
  slice._offset = begin;
  slice.length = end - begin;

  return slice;
};

function cloneSlice(slice) {
  var cloned = new ImmutableVectorSlice();
  cloned._vec = slice._vec;
  cloned._offset = slice._offset;
  cloned.length = slice.length;
  return cloned;
}

ImmutableVectorSlice.prototype.slice = function(begin, end) {
  var beginEnd = sanitizeSliceParams(this.length, begin, end);
  begin = beginEnd[0];
  end = beginEnd[1];

  var newSlice = cloneSlice(this);
  newSlice._offset += begin;
  newSlice.length = end - begin;

  return newSlice;
};

ImmutableVectorSlice.prototype.get = function(index) {
  if (index >= 0 && index < this.length) {
    return this._vec.get(this._offset + index);
  }
};

ImmutableVectorSlice.prototype.set = function(index, val) {
  if (index >= this.length || index < 0) {
    throw new Error('setting past end of vector is not implemented');
  }
  var newSlice = cloneSlice(this);
  newSlice._vec = this._vec.set(this._offset + index, val);
  return newSlice;
};

ImmutableVectorSlice.prototype.push = function(val) {
  var newSlice = cloneSlice(this);
  var realIndex = this._offset + this.length;
  if (realIndex < this._vec.length) {
    newSlice._vec = this._vec.set(realIndex, val);
  } else if (realIndex == this._vec.length) {
    newSlice._vec = this._vec.push(val);
  } else {
    throw new Error('invariant violation: slice goes past end of vector');
  }
  newSlice.length++;
  return newSlice;
};

ImmutableVectorSlice.prototype.pop = function() {
  if (this.length === 0) return this;

  var newSlice = cloneSlice(this);
  newSlice.length--;
  return newSlice;
};

module.exports = ImmutableVector;
