var constants = require('./constants');
var nodeBits = constants.nodeBits;
var nodeSize = constants.nodeSize;
var nodeBitmask = constants.nodeBitmask;

var ImmutableVectorIterator = function(vec) {
  this._vec = vec;
  this._index = -1;
  this._stack = [];
  this._node = vec._contents;
  return this;
}

ImmutableVectorIterator.prototype.next = function() {
  // Iterator state:
  //  _vec: Vector we're iterating over.
  //  _node: "Current" leaf node, meaning the one we returned a value from
  //         on the previous call.
  //  _index: Index (within entire vector, not node) of value returned last
  //          time.
  //  _stack: Path we traveled to current node, as [node, local index]
  //          pairs, starting from root node, not including leaf.

  var vec = this._vec;
  var shift;

  if (this._index === vec.length - 1) {
    return {done: true};
  }

  if (this._index > 0 && (this._index & nodeBitmask) === nodeSize - 1) {
    // Using the stack, go back up the tree, stopping when we reach a node
    // whose children we haven't fully iterated over.
    var step;
    while ((step = this._stack.pop())[1] === nodeSize - 1) ;
    step[1]++;
    this._stack.push(step);
    this._node = step[0][step[1]];
  }

  for (shift = this._stack.length * nodeBits; shift < this._vec._maxShift;
       shift += nodeBits) {
    this._stack.push([this._node, 0]);
    this._node = this._node[0];
  }

  this._index++;
  return {value: this._node[this._index & nodeBitmask], done: false};
};

module.exports = ImmutableVectorIterator;
