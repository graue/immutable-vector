var nodeSize = 32;
var invLogNodeSize = 1 / Math.log(nodeSize);

function PersistentVector() {
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
    this._depth = this._capacity = 0;
  } else {
    this._depth = depth;
    this._capacity = Math.pow(nodeSize, depth) | 0;
  }
}

function cloneVec(vec) {
  var newVec = new PersistentVector();
  newVec._contents = vec._contents;
  newVec.length = vec.length;
  newVec._depth = vec._depth;
  newVec._capacity = vec._capacity;
  return newVec;
}

// Find the leaf node which contains vector index `index`.
function findLeafNode(vec, index) {
  if (index >= 0 && index < vec.length) {
    var level = vec._contents;
    var childCapacity = vec._capacity / nodeSize;
    while (childCapacity > 1) {
      level = level[Math.floor(index / childCapacity) % nodeSize];
      childCapacity /= nodeSize;
    }
    return level;
  }
}

PersistentVector.prototype.get = function PersistentVector__get(index) {
  var leaf = findLeafNode(this, index);
  if (leaf) {
    return leaf[index % nodeSize];
  }
}

function internalSet(vec, index, val) {
  var newVec = cloneVec(vec);

  var level = newVec._contents = vec._contents.slice();
  var childCapacity = vec._capacity / nodeSize;
  while (childCapacity > 1) {
    var subLevelIndex = Math.floor(index / childCapacity) % nodeSize;
    if (level[subLevelIndex]) {
      level[subLevelIndex] = level[subLevelIndex].slice();
    } else {
      // Need to create new node. This can happen when inserting an
      // element.
      level[subLevelIndex] = new Array(nodeSize);
    }
    level = level[subLevelIndex];
    childCapacity /= nodeSize;
  }
  level[index % nodeSize] = val;
  return newVec;
}

PersistentVector.prototype.set = function PersistentVector__set(index, val) {
  if (index >= this.length || index < 0) {
    throw new Error('setting past end of vector is not implemented');
  }
  return internalSet(this, index, val);
};

PersistentVector.prototype.push = function PersistentVector__push(val) {
  if (this.length % nodeSize > 0) {
    // There's already room for the new element, so this is just a
    // simple set.
    var newVec = internalSet(this, this.length, val);
    newVec.length++;
    return newVec;
  } else if (this.length < this._capacity) {
    // The root is ok, but we'll need to create some new nodes.
    // Actually, the implementation is the same as before - see the
    // case where level[subLevelIndex] is undefined in internalSet.
    // However, maybe that code should live here, not there, I dunno.
    var newVec = internalSet(this, this.length, val);
    newVec.length++;
    return newVec;
  } else if (this.length > 0) {
    // We'll need a new root node.
    var newVec = cloneVec(this);
    newVec.length++;
    newVec._depth++;
    newVec._capacity *= nodeSize;
    var node = [];
    newVec._contents = [this._contents, node];
    for (var i = 2; i < newVec._depth; i++) {
      var newNode = [];
      node.push(newNode);
      node = newNode;
    }
    node[0] = val;
    return newVec;
  } else {
    // Empty vector? Just create a new one with the pushed value.
    return new PersistentVector(val);
  }
};

PersistentVector.prototype.pop = function PersistentVector__pop(val) {
  // FIXME: don't use slice for this
  return this.slice(0, this.length - 1);
};

PersistentVector.prototype.slice = function PersistentVector__slice(begin, end) {
  // FIXME
  // This is gonna be hard to do right, involving an offset.
  // Just to make the tests pass, here is a cheating and bogus implementation
  // that does a bad thing.
  var newVec = new PersistentVector();
  if (end === undefined || typeof end !== 'number' || end > this.length) {
    end = this.length;
  }
  if (begin === undefined || typeof begin !== 'number' || begin < 0) {
    begin = 0;
  }
  for (var i = begin; i < end; i++) {
    newVec = newVec.push(this.get(i));
  }
  return newVec;
};

PersistentVector.prototype.equals = function PersistentVector__equals(other) {
  // FIXME: way slower than necessary
  var val;
  if (this.length !== other.length) return false;
  for (var i = 0; i < this.length; i++) {
    val = this.get(i);
    if (val instanceof PersistentVector) {
      if (!val.equals(other.get(i))) {
        return false;
      }
    } else {
      if (val !== other.get(i)) {
        return false;
      }
    }
  }
  return true;
};

PersistentVector.prototype.toArray = function PersistentVector__toArray() {
  // FIXME: way slower than necessary
  var out = [];
  for (var i = 0; i < this.length; i++) {
    out.push(this.get(i));
  }
  return out;
};

module.exports = PersistentVector;
