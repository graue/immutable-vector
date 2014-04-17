var ImmutableVector = require('./impls/vectorTrie');

// Add convenience methods.

ImmutableVector.prototype.peek || (ImmutableVector.prototype.peek =
function() {
  return this.get(this.length - 1);
});

module.exports = ImmutableVector;
