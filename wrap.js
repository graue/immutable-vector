module.exports = function(impl) {
  // Add convenience methods and fast slicing to the implementation.
  impl = require('./slice')(impl);
  impl = require('./convenience')(impl);
  return impl;
}
