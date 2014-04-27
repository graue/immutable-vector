function ImmutableVectorSlice(vec, begin, end) {
  if (vec instanceof ImmutableVectorSlice) {
    // Don't re-wrap if the argument is already a slice.
    this._vec = vec._vec;
    this._offset = vec._offset + begin;
    this.length = end - begin;
  } else {
    this._vec = vec;
    this._offset = begin;
    this.length = end - begin;
  }
  return this;
};

// Dance to get circular dependency working.
module.exports = ImmutableVectorSlice;
var ImmutableVector = require('./ImmutableVector');
ImmutableVectorSlice.prototype = new ImmutableVector();

function cloneSlice(slice) {
  var cloned = new ImmutableVectorSlice();
  cloned._vec = slice._vec;
  cloned._offset = slice._offset;
  cloned.length = slice.length;
  return cloned;
}

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

module.exports = ImmutableVectorSlice;
