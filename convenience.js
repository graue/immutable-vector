// Add convenience methods to an immutable vector implementation.

module.exports = function(ImmutableVector) {
  ImmutableVector.prototype.peek || (ImmutableVector.prototype.peek =
  function() {
    return this.get(this.length - 1);
  });

  return ImmutableVector;
};
