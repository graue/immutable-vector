var nodeBits = 5;
var nodeSize = (1<<nodeBits); // 32
var nodeBitmask = nodeSize - 1;

function ImmutableVector() {
  var len = arguments.length;
  var nodes = [];
  var lowerNodes;
  var node;
  var i;
  var depth = 1;

  for (i = 0; i < len; i += nodeSize) {
    node = [].slice.call(arguments, i, i + nodeSize);
    nodes.push(node);
  }

  while(nodes.length > 1) {
    lowerNodes = nodes;
    nodes = [];
    for (i = 0; i < lowerNodes.length; i += nodeSize) {
      node = lowerNodes.slice(i, i + nodeSize);
      nodes.push(node);
    }
    depth++;
  }

  this._contents = nodes[0];
  this.length = len;
  if (!this._contents) {
    this._maxShift = 0;
  } else {
    this._maxShift = nodeBits * (depth - 1);
  }
}

module.exports = ImmutableVector;

function cloneVec(vec) {
  var newVec = new ImmutableVector();
  newVec._contents = vec._contents;
  newVec.length = vec.length;
  newVec._maxShift = vec._maxShift;
  return newVec;
}

ImmutableVector.prototype.get = function ImmutableVector__get(index) {
  if (index >= 0 && index < this.length) {
    var shift = this._maxShift;
    var node = this._contents;
    while (shift > 0) {
      node = node[(index >> shift) & nodeBitmask];
      shift -= nodeBits;
    }
    return node[index & nodeBitmask];
  }
}

function internalSet(vec, index, val) {
  var newVec = cloneVec(vec);
  var node = newVec._contents = vec._contents.slice();
  var shift = vec._maxShift;
  while (shift > 0) {
    var childIndex = (index >> shift) & nodeBitmask;
    if (node[childIndex]) {
      node[childIndex] = node[childIndex].slice();
    } else {
      // Need to create new node. Can happen when inserting element.
      node[childIndex] = new Array(nodeSize);
    }
    node = node[childIndex];
    shift -= nodeBits;
  }
  node[index & nodeBitmask] = val;
  return newVec;
}

ImmutableVector.prototype.set = function ImmutableVector__set(index, val) {
  if (index >= this.length || index < 0) {
    throw new Error('setting past end of vector is not implemented');
  }
  return internalSet(this, index, val);
};

ImmutableVector.prototype.push = function ImmutableVector__push(val) {
  if ((this.length & nodeBitmask) > 0) {
    // There's already room for the new element, so this is just a
    // simple set.
    var newVec = internalSet(this, this.length, val);
    newVec.length++;
    return newVec;
  } else if (this.length === 0) {
    // Empty vector? Just create a new one with the pushed value.
    return new ImmutableVector(val);
  } else if (this.length < (nodeSize << this._maxShift)) {
    // The root is ok, but we'll need to create some new nodes.
    // Actually, the implementation is the same as before - see the
    // case where level[subLevelIndex] is undefined in internalSet.
    // However, maybe that code should live here, not there, I dunno.
    var newVec = internalSet(this, this.length, val);
    newVec.length++;
    return newVec;
  } else {
    // We'll need a new root node.
    var newVec = cloneVec(this);
    newVec.length++;
    newVec._maxShift += nodeBits;
    var node = [];
    newVec._contents = [this._contents, node];
    var depth = newVec._maxShift / nodeBits;
    for (var i = 1; i < depth; i++) { // XXX I don't understand why this is
                                      // 1 and not 2 (as it was in vectorTrie)
      var newNode = [];
      node.push(newNode);
      node = newNode;
    }
    node[0] = val;
    return newVec;
  }
};

ImmutableVector.prototype.pop = function ImmutableVector__pop() {
  var popped;

  if (this.length === 0) return this;
  if (this.length === 1) return new ImmutableVector();

  // If the last leaf node will remain non-empty after popping,
  // simply set last element to null (to allow GC).
  if ((this.length & nodeBitmask) !== 1) {
    popped = internalSet(this, this.length - 1, null);
  }
  // If the length is a power of the branching factor plus one,
  // reduce the tree's depth and install the root's first child as
  // the new root.
  else if (this.length - 1 === nodeSize << (this._maxShift - nodeBits)) {
    popped = cloneVec(this);
    popped._contents = this._contents[0];
    popped._maxShift = this._maxShift - nodeBits;
  }
  // Otherwise, the root stays the same but we remove a leaf node.
  else {
    popped = cloneVec(this);

    var node = popped._contents = popped._contents.slice();
    var shift = this._maxShift;
    var removedIndex = this.length - 1;

    while (shift > nodeBits) { // i.e., Until we get to lowest non-leaf node.
      var localIndex = (removedIndex >> shift) & nodeBitmask;
      node = node[localIndex] = node[localIndex].slice();
      shift -= nodeBits;
    }
    node[(removedIndex >> shift) & nodeBitmask] = null;
  }
  popped.length--;
  return popped;
};

var ImmutableVectorSlice = require('./ImmutableVectorSlice');

ImmutableVector.prototype.slice = function ImmutableVector__slice(begin, end) {
  if (typeof end !== 'number' || end > this.length) end = this.length;
  if (typeof begin !== 'number' || begin < 0) begin = 0;
  if (end < begin) end = begin;

  if (begin === 0 && end === this.length) {
    return this;
  }

  return new ImmutableVectorSlice(this, begin, end);
};

// TODO: See if equals and toArray are faster using a traversal.

ImmutableVector.prototype.equals = function ImmutableVector__equals(other) {
  var val;
  if (this.length !== other.length) return false;
  for (var i = 0; i < this.length; i++) {
    val = this.get(i);
    if (val instanceof ImmutableVector) {
      if (!val.equals(other.get(i))) return false;
    } else {
      if (val !== other.get(i)) return false;
    }
  }
  return true;
};

ImmutableVector.prototype.toArray = function ImmutableVector__toArray() {
  var out = [];
  for (var i = 0; i < this.length; i++) {
    out.push(this.get(i));
  }
  return out;
};

ImmutableVector.prototype.peek = function ImmutableVector__peek() {
  return this.get(this.length - 1);
};
